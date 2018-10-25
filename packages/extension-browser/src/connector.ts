import * as url from 'url';

import { Engine } from 'hint';
import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';
import {
    ConnectorOptionsConfig,
    HttpHeaders,
    IAsyncHTMLDocument,
    IAsyncHTMLElement,
    IAsyncWindow,
    IConnector,
    FetchEnd,
    NetworkData
} from 'hint/dist/src/lib/types';

import { BackgroundEvents, ContentEvents } from './types';
import { AsyncWindow, AsyncHTMLDocument, AsyncHTMLElement } from './web-async-html';
import browser from './util/browser';

export default class WebExtensionConnector implements IConnector {
    private _window: IAsyncWindow | undefined;
    private _engine: Engine;
    private _options: ConnectorOptionsConfig;
    private _pageHTML = '';

    public constructor(engine: Engine, options?: ConnectorOptionsConfig) {
        this._engine = engine;
        this._options = Object.apply({ waitFor: 1000 }, options);

        // TODO: Account for events sent before listener was added (queue in background-script?).
        browser.runtime.onMessage.addListener(async (events: BackgroundEvents) => {
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
                this._window = new AsyncWindow(new AsyncHTMLDocument(document, this._pageHTML));

                if (document.documentElement) {
                    await this._engine.emitAsync('traverse::start', { resource });
                    await this.traverseAndNotify(document.documentElement, this._window.document);
                    await this._engine.emitAsync('traverse::end', { resource });
                }

                await this._engine.emitAsync('scan::end', { resource });
            }, this._options.waitFor);
        };

        if (document.readyState === 'complete') {
            onLoad();
        } else {
            window.addEventListener('load', onLoad);
        }
    }

    private sendMessage(message: ContentEvents) {
        browser.runtime.sendMessage(message);
    }

    /** Traverses the DOM while sending `element::*` events. */
    private async traverseAndNotify(node: Element, doc: IAsyncHTMLDocument): Promise<void> {
        const element = new AsyncHTMLElement(node, doc);
        const name = node.tagName.toLowerCase();
        const resource = location.href;

        await this._engine.emitAsync(`element::${name}`, { element, resource });
        await this._engine.emitAsync(`traverse::down`, { element, resource });

        // Recursively traverse child elements.
        for (let i = 0; i < node.children.length; i++) {
            await this.traverseAndNotify(node.children[i], doc);
        }

        await this._engine.emitAsync(`traverse::up`, { element, resource });
    }

    private async notifyFetch(event: FetchEnd) {
        const { charset, mediaType } = getContentTypeData(null, event.response.url, event.response.headers, null as any);

        if (event.response.url === location.href) {
            this._pageHTML = event.response.body.content;
        }

        event.response.charset = charset || '';
        event.response.mediaType = mediaType || '';

        const type = getType(mediaType || '');

        await this._engine.emitAsync(`fetch::end::${type}`, event);
    }

    private mapResponseHeaders(headers: Headers): HttpHeaders {
        const responseHeaders: HttpHeaders = {};

        headers.forEach((val, key) => {
            responseHeaders[key] = val;
        });

        return responseHeaders;
    }

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
            this._engine.once('scan::end', () => {
                resolve();
                this.sendMessage({ done: true });
            });
        });
    }

    /* istanbul ignore next */
    public evaluate(source: string): Promise<any> {
        return Promise.resolve(this._window ? this._window.evaluate(source) : null);
    }

    /* istanbul ignore next */
    public querySelectorAll(selector: string): Promise<IAsyncHTMLElement[]> {
        return this._window ? this._window.document.querySelectorAll(selector) : Promise.resolve([]);
    }

    /* istanbul ignore next */
    public close() {
        return Promise.resolve();
    }

    /* istanbul ignore next */
    public get dom(): IAsyncHTMLDocument | undefined {
        return this._window && this._window.document;
    }

    /* istanbul ignore next */
    public get html(): Promise<string> {
        return this._window ? this._window.document.pageHTML() : Promise.resolve('');
    }
}
