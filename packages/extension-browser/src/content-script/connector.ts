import * as url from 'url';

import { Engine } from 'hint';
import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';
import {
    ConnectorOptionsConfig,
    HttpHeaders,
    IAsyncHTMLDocument,
    IAsyncHTMLElement,
    IConnector,
    FetchEnd,
    NetworkData
} from 'hint/dist/src/lib/types';

import { Events } from '../shared/types';
import { AsyncWindow, AsyncHTMLDocument, AsyncHTMLElement } from './web-async-html';
import { browser, document, location, window } from '../shared/globals';

export default class WebExtensionConnector implements IConnector {
    private _document = new AsyncHTMLDocument(document);
    private _window = new AsyncWindow(this._document); // eslint-disable-line
    private _engine: Engine;
    private _onComplete: (resource: string) => void = () => { };
    private _options: ConnectorOptionsConfig;

    public constructor(engine: Engine, options?: ConnectorOptionsConfig) {
        this._engine = engine;
        this._options = options || {};

        if (!this._options.waitFor) {
            this._options.waitFor = 1000;
        }

        browser.runtime.onMessage.addListener(async (events: Events) => {
            if (events.fetchEnd) {
                await this.notifyFetch(events.fetchEnd);
            }
            if (events.fetchStart) {
                await this._engine.emitAsync('fetch::start', events.fetchStart);
            }
            // TODO: Trigger 'fetch::start::target'.
        });

        const onLoad = async () => {
            const resource = location.href;

            await this._engine.emitAsync('can-evaluate::script', { resource });

            setTimeout(async () => {

                if (this._window && document.documentElement) {
                    await this._engine.emitAsync('traverse::start', { resource });
                    await this.traverseAndNotify(document.documentElement, this._window.document);
                    await this._engine.emitAsync('traverse::end', { resource });
                }

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

    /** Traverses the DOM while sending `element::*` events. */
    private async traverseAndNotify(node: Element, doc: IAsyncHTMLDocument): Promise<void> {
        const element = new AsyncHTMLElement(node, doc);
        const name = node.tagName.toLowerCase();
        const resource = location.href;

        await this._engine.emitAsync(`element::${name}` as 'element::*', { element, resource });
        await this._engine.emitAsync(`traverse::down`, { element, resource });

        // Recursively traverse child elements.
        for (let i = 0; i < node.children.length; i++) {
            await this.traverseAndNotify(node.children[i], doc);
        }

        await this._engine.emitAsync(`traverse::up`, { element, resource });
    }

    private setFetchElement(event: FetchEnd) {
        const url = event.request.url;
        const elements = Array.from(document.querySelectorAll('[href],[src]')).filter((element: any) => {
            return element.href === url || element.src === url;
        });

        if (elements.length) {
            event.element = new AsyncHTMLElement(elements[0], this._document);
        }
    }

    private setFetchType(event: FetchEnd): string {
        const { charset, mediaType } = getContentTypeData(null, event.response.url, event.response.headers, null as any);

        event.response.charset = charset || '';
        event.response.mediaType = mediaType || '';

        return getType(mediaType || '');
    }

    private async notifyFetch(event: FetchEnd) {
        this.setFetchElement(event);
        const type = this.setFetchType(event);

        if (event.response.url === location.href) {
            this._document.setPageHTML(event.response.body.content);
        }

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

    public evaluate(source: string): Promise<any> {
        return Promise.resolve(this._window.evaluate(source));
    }

    public querySelectorAll(selector: string): Promise<IAsyncHTMLElement[]> {
        return this._document.querySelectorAll(selector);
    }

    /* istanbul ignore next */
    public close() {
        return Promise.resolve();
    }

    public get dom(): IAsyncHTMLDocument {
        return this._document;
    }

    /* istanbul ignore next */
    public get html(): Promise<string> {
        return this._document.pageHTML();
    }
}
