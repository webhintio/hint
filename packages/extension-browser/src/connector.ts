import * as url from 'url';

import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow, IConnector, FetchEnd, NetworkData } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { BackgroundEvents, ContentEvents } from './types';
import { AsyncWindow, AsyncHTMLDocument, AsyncHTMLElement } from './web-async-html';

type Options = {
    waitFor: number;
};

const browser: typeof chrome = (self as any).browser || self.chrome;

export default class WebExtensionConnector implements IConnector {
    private _window: IAsyncWindow;
    private _engine: Engine;
    private _options: Options;

    public constructor(engine: Engine, options: Options) {
        this._engine = engine;
        this._window = new AsyncWindow(new AsyncHTMLDocument(document));
        this._options = { waitFor: 1000, ...options };

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

        window.addEventListener('load', async () => {
            const resource = location.href;

            await this._engine.emitAsync('can-evaluate::script', { resource });

            setTimeout(async () => {
                if (document.documentElement) {
                    await this._engine.emitAsync('traverse::start', { resource });
                    await this.traverseAndNotify(document.documentElement, this._window.document);
                    await this._engine.emitAsync('traverse::end', { resource });
                }

                await this._engine.emitAsync('scan::end', { resource });

                this.sendMessage({ done: true });
            }, this._options.waitFor);
        });
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
        const { charset, mediaType } = getContentTypeData(null, event.response.url, event.response.headers, null);

        event.response.charset = charset;
        event.response.mediaType = mediaType;

        const type = getType(mediaType);

        await this._engine.emitAsync(`fetch::end::${type}`, event);
    }

    public async fetchContent(target: string, headers?: Record<string, string>): Promise<NetworkData> {
        return await fetch(target, { headers }).then(async (response) => {
            const { charset, mediaType } = getContentTypeData(null, target, response.headers, null);

            return {
                request: { headers, url: target },
                response: {
                    body: {
                        content: await response.text(),
                        rawContent: null, // TODO: Set once this supports `Blob`.
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

        await this._engine.emitAsync('scan::start', { resource });

        this.sendMessage({ ready: true });

        return new Promise((resolve) => {
            this._engine.once('scan::end', () => {
                resolve();
            });
        });
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
