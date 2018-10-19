import * as url from 'url';

import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';
import { getContentTypeData, isTextMediaType, getType } from 'hint/dist/src/lib/utils/content-type';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow } from 'hint/dist/src/lib/types/async-html';

import {
    IConnector,
    IFetchOptions,
    Event, FetchEnd, NetworkData
} from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { Details, ExtensionEvents } from './types';

const defaultOptions = {};

export default class WebExtensionConnector implements IConnector {
    private _window: IAsyncWindow | undefined;
    private _options: any;
    private engine: Engine;

    public constructor(engine: Engine, config: object) {
        this._options = Object.assign({}, defaultOptions, config);
        this.engine = engine;

        const browser = self.browser || self.chrome;

        browser.runtime.onMessage.addListener((events: ExtensionEvents) => {
            if (event.onCompleted) {
                this.onCompleted(event.onCompleted);
            }
        });
    }

    private onCompleted(details: Details): void {
        const type = getType(details.type);
        const event: FetchEnd = {
            resource: details.
        };
        this.engine.emitAsync(`fetch::end::${type}`, event);
    }

    private async notifyFetch(event: FetchEnd) {
        const type = getType(event.response.mediaType);

        await this.engine.emitAsync(`fetch::end::${type}`, event);
    }

    private async fetch(target: string, options?: IFetchOptions) {
        const event = await this.fetchData(target, options);

        return this.notifyFetch(event);
    }

    private async fetchData(target: string, options?: IFetchOptions): Promise<FetchEnd> {
        const content: NetworkData = await this.fetchContent(target, undefined, options);
        const uri = getAsUri(target);

        return {
            element: null,
            request: content.request,
            resource: uri ? url.format(uri) : /* istanbul ignore next */ '',
            response: content.response
        };
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public async fetchContent(target: string, headers?: object, options?: IFetchOptions): Promise<NetworkData> {
        /*
         * target can have one of these forms:
         *   - /path/to/file
         *   - C:/path/to/file
         *   - file:///path/to/file
         *   - file:///C:/path/to/file
         *
         * That's why we need to parse it to an URL
         * and then get the path string.
         */
        const uri = getAsUri(target);
        let content = '';

        // Need to do some magic to create a fetch::end::*
        return {
            request: {} as any,
            response: {
                body: {
                    content,
                    rawContent,
                    rawResponse() {
                        /* istanbul ignore next */
                        return Promise.resolve(rawContent);
                    }
                },
                charset: contentType.charset || /* istanbul ignore next */ '',
                headers: {},
                hops: [],
                mediaType: contentType.mediaType || /* istanbul ignore next */ '',
                statusCode: 200,
                url: uri ? url.format(uri) : /* istanbul ignore next */ ''
            }
        };
    }

    public async collect(target: url.URL, options?: IFetchOptions) {
        const resource = target.href;

        this.engine.emitAsync('scan::start', { resource });

        this.engine.emitAsync('fetch::start', { resource });

        await this.notifyFetch(this.fetchData(target.href, options));

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
