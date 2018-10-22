import * as url from 'url';

import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow, IConnector, IFetchOptions, FetchEnd, NetworkData } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { ExtensionEvents } from './types';
import { AsyncWindow, AsyncHTMLDocument, AsyncHTMLElement } from './web-async-html';

export default class WebExtensionConnector implements IConnector {
    private _window: IAsyncWindow;
    private engine: Engine;

    public constructor(engine: Engine) {
        this.engine = engine;
        this._window = new AsyncWindow(new AsyncHTMLDocument(document));

        const browser: typeof chrome = (self as any).browser || self.chrome;

        // TODO: Account for events sent before listener was added (queue in background-script?).
        browser.runtime.onMessage.addListener(async (events: ExtensionEvents) => {
            if (events.fetchEnd) {
                await this.notifyFetch(events.fetchEnd);
            }
            if (events.fetchStart) {
                await this.engine.emitAsync('fetch::start', events.fetchStart);
            }
            // TODO: Trigger 'fetch::start::target'.
        });

        window.addEventListener('load', async () => {
            if (document.documentElement) {
                await this.engine.emitAsync('can-evaluate::script', { resource: location.href });
                await this.engine.emitAsync('traverse::start', event);
                await this.traverseAndNotify(document.documentElement, this._window.document);
                await this.engine.emitAsync('traverse::end', event);
            }
        });
    }

    /** Traverses the DOM while sending `element::*` events. */
    private async traverseAndNotify(node: Element, doc: IAsyncHTMLDocument): Promise<void> {
        const element = new AsyncHTMLElement(node, doc);
        const name = node.tagName.toLowerCase();
        const resource = location.href;

        await this.engine.emitAsync(`element::${name}`, { element, resource });
        await this.engine.emitAsync(`traverse::down`, { element, resource });

        // Recursively traverse child elements.
        for (let i = 0; i < node.children.length; i++) {
            await this.traverseAndNotify(node.children[i], doc);
        }

        await this.engine.emitAsync(`traverse::up`, { element, resource });
    }

    private async notifyFetch(event: FetchEnd) {
        const { charset, mediaType } = getContentTypeData(null, event.response.url, event.response.headers, null);

        event.response.charset = charset;
        event.response.mediaType = mediaType;

        const type = getType(mediaType);

        await this.engine.emitAsync(`fetch::end::${type}`, event);
    }

    public async fetchContent(target: string, headers?: Record<string, string>): Promise<NetworkData> {
        return await fetch(target, { headers }).then(async (response) => {
            const { charset, mediaType } = getContentTypeData(null, target, response.headers, null);

            return {
                request: { headers, url: target },
                response: {
                    body: {
                        content: await response.text(),
                        rawContent: null,
                        rawResponse: null
                    },
                    charset,
                    headers: response.headers,
                    hops: [],
                    mediaType,
                    statusCode: response.status,
                    url: target
                }
            };
        });
    }

    public async collect(target: url.URL) {
        const resource = target.href;

        await this.engine.emitAsync('scan::start', { resource });

        // TODO: Determine when scan is over... (N seconds after `window.onload`, or after idle without `FetchEnd`s?)

        await this.engine.emitAsync('scan::end', { resource });
    }

    /* istanbul ignore next */
    public evaluate(source: string): Promise<any> {
        return Promise.resolve(this._window ? this._window.evaluate(source) : null);
    }

    /* istanbul ignore next */
    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
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
