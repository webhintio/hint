import * as url from 'url';

import { Engine } from 'hint';
import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';
import {
    ConnectorOptionsConfig,
    HttpHeaders,
    IConnector,
    FetchEnd,
    NetworkData,
    HTMLDocument,
    HTMLElement
} from 'hint/dist/src/lib/types';
import getElementByUrl from 'hint/dist/src/lib/utils/dom/get-element-by-url';

import { Events } from '../shared/types';
import { eval } from '../shared/globals';
import { browser, document, location, window } from '../shared/globals';
import createHTMLDocument from 'hint/dist/src/lib/utils/dom/create-html-document';
import traverse from 'hint/dist/src/lib/utils/dom/traverse';

export default class WebExtensionConnector implements IConnector {
    private _document: HTMLDocument | undefined;
    private _originalDocument: HTMLDocument | undefined;
    private _engine: Engine;
    private _fetchEndQueue: FetchEnd[] = [];
    private _onComplete: (resource: string) => void = () => { };
    private _options: ConnectorOptionsConfig;

    public constructor(engine: Engine, options?: ConnectorOptionsConfig) {
        this._engine = engine;
        this._options = options || {};

        if (!this._options.waitFor) {
            this._options.waitFor = 1000;
        }

        (engine as Engine<import('@hint/parser-html').HTMLEvents>).on('parse::end::html', (event) => {
            if (event.resource === location.href) {
                this._originalDocument = event.document;
            }
        });

        browser.runtime.onMessage.addListener(async (events: Events) => {
            if (events.fetchEnd) {
                await this.notifyFetch(events.fetchEnd);
            }
            if (events.fetchStart) {
                await this._engine.emitAsync('fetch::start', events.fetchStart);
            }
            // TODO: Trigger 'fetch::start::target'.
        });

        const onLoad = () => {
            const resource = location.href;

            setTimeout(async () => {

                if (document.documentElement) {
                    this._document = createHTMLDocument(document.documentElement.outerHTML, this._originalDocument);

                    await traverse(this._document, this._engine, resource);
                }

                await this.sendFetchEndEvents();

                /*
                 * Evaluate after the traversing, just in case something goes wrong
                 * in any of the evaluation and some scripts are left in the DOM.
                 */
                await this._engine.emitAsync('can-evaluate::script', { resource });

                this._onComplete(resource);
            }, this._options.waitFor);
        };

        if (document.readyState === 'complete') {
            setTimeout(onLoad, 0);
        } else {
            window.addEventListener('load', onLoad);
        }
    }

    private sendMessage(message: Events) {
        browser.runtime.sendMessage(message);
    }

    private async sendFetchEndEvents() {
        for (const event of this._fetchEndQueue) {
            await this.notifyFetch(event);
        }
    }

    private setFetchElement(event: FetchEnd) {
        const url = event.request.url;

        if (this._document) {
            event.element = getElementByUrl(this._document, url, location.href);
        }
    }

    private setFetchType(event: FetchEnd): string {
        const { charset, mediaType } = getContentTypeData(null, event.response.url, event.response.headers, null as any);

        event.response.charset = charset || '';
        event.response.mediaType = mediaType || '';

        return getType(mediaType || '');
    }

    private async notifyFetch(event: FetchEnd) {
        /*
         * Delay dispatching FetchEnd until we have the DOM snapshot to populate `element`.
         * But immediately process target's FetchEnd to populate `originalDocument`.
         */
        if (!this._document && event.response.url !== location.href) {
            this._fetchEndQueue.push(event);

            return;
        }

        this.setFetchElement(event);
        const type = this.setFetchType(event);

        await this._engine.emitAsync(`fetch::end::${type}` as 'fetch::end::*', event);
    }

    private mapResponseHeaders(headers: Headers): HttpHeaders {
        const responseHeaders: HttpHeaders = {};

        headers.forEach((val, key) => {
            responseHeaders[key] = val;
        });

        return responseHeaders;
    }

    /* istanbul ignore next */
    public async fetchContent(target: string, headers?: any): Promise<NetworkData> {
        return await fetch(target, { headers }).then(async (response) => {
            const responseHeaders = this.mapResponseHeaders(response.headers);
            const { charset, mediaType } = getContentTypeData(null, target, responseHeaders, null as any);

            return {
                request: { headers: headers as any, url: target },
                response: {
                    body: {
                        content: await response.text(),
                        rawContent: null as any, // TODO: Set once this supports `Blob`.
                        rawResponse: null as any
                    },
                    charset: charset || '',
                    headers: responseHeaders,
                    hops: [],
                    mediaType: mediaType || '',
                    statusCode: response.status,
                    url: target
                }
            };
        });
    }

    public async collect(target: url.URL) {
        const resource = target.href;

        await this._engine.emitAsync('scan::start', { resource });

        this.sendMessage({ ready: true });

        return new Promise((resolve) => {
            this._onComplete = async (resource: string) => {
                await this._engine.emitAsync('scan::end', { resource });
                resolve();
                this.sendMessage({ done: true });
            };
        });
    }

    private needsToRunInPage(source: string) {
        return source.includes('/*RunInPageContext*/');
    }

    /**
     * Runs a script in the website context.
     *
     * By default, `eval` runs the scripts in a different context
     * but, some scripts, needs to run in the same context
     * of the website.
     */
    private evaluateInPage(source: string): Promise<any> {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            const config = {
                attributes: true,
                childList: false,
                subtree: false
            };

            const callback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
                mutationsList.forEach((mutation: MutationRecord) => {
                    if (mutation.type !== 'attributes' && mutation.attributeName !== 'data-result') {
                        return;
                    }

                    const result = JSON.parse(script.getAttribute('data-result')!);

                    document.body.removeChild(script);
                    observer.disconnect();

                    resolve(result);
                });
            };

            const observer = new MutationObserver(callback);

            observer.observe(script, config);

            document.body.appendChild(script);
            script.textContent = `(async () => {
const scriptElement = document.currentScript;
const result = await ${source}

scriptElement.setAttribute('data-result', JSON.stringify(result));
})();`;
        });
    }

    public evaluate(source: string): Promise<any> {
        /*
         * TODO: another option here is changing the interface of IConnector
         * to allow another parameter in evaluate to indicate if we should run
         * the script in the page context or if eval is enough.
         */
        if (this.needsToRunInPage(source)) {
            return this.evaluateInPage(source);
        }

        // `eval` will run the code inside the browser.
        return Promise.resolve(eval(source)); // eslint-disable-line no-eval
    }

    public querySelectorAll(selector: string): HTMLElement[] {
        return this._document ? this._document.querySelectorAll(selector) : [];
    }

    /* istanbul ignore next */
    public close() {
        return Promise.resolve();
    }

    public get dom(): HTMLDocument | undefined {
        return this._document;
    }

    /* istanbul ignore next */
    public get html(): string {
        return this._document ? this._document.pageHTML() : '';
    }
}
