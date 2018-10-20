import * as url from 'url';

import { getType } from 'hint/dist/src/lib/utils/content-type';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow } from 'hint/dist/src/lib/types/async-html';
import { IConnector, IFetchOptions, FetchEnd, NetworkData } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { ExtensionEvents } from './types';
import { AsyncWindow, AsyncHTMLDocument } from './web-async-html';

export default class WebExtensionConnector implements IConnector {
    private _window: IAsyncWindow;
    private engine: Engine;

    public constructor(engine: Engine, config: object) {
        this.engine = engine;
        this._window = new AsyncWindow(new AsyncHTMLDocument(document));

        const browser: typeof chrome = (self as any).browser || self.chrome;

        browser.runtime.onMessage.addListener((events: ExtensionEvents) => {
            if (events.fetchEnd) {
                this.notifyFetch(events.fetchEnd);
            }
            if (events.fetchStart) {
                this.engine.emitAsync('fetch::start', events.fetchStart);
            }
        });
    }

    private async notifyFetch(event: FetchEnd) {
        const type = getType(event.response.mediaType);

        await this.engine.emitAsync(`fetch::end::${type}`, event);
    }

    public async fetchContent(target: string, headers?: object, options?: IFetchOptions): Promise<NetworkData> {
        // TODO
    }

    public async collect(target: url.URL, options?: IFetchOptions) {
        const resource = target.href;

        await this.engine.emitAsync('scan::start', { resource });

        // TODO: Figure out how to determine when scan is over...

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
