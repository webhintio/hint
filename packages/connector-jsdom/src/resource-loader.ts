import { URL } from 'url';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ResourceLoader } from 'jsdom';

import JSDOMConnector from './connector';
import { JSDOMAsyncHTMLElement } from 'hint/dist/src/lib/types/jsdom-async-html';
import { NetworkData, FetchEnd, FetchError } from 'hint/dist/src/lib/types';
import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';

const debug: debug.IDebugger = d(__filename);

export default class CustomResourceLoader extends ResourceLoader {
    private _connector: JSDOMConnector;

    public constructor(connector: JSDOMConnector) {
        super();

        this._connector = connector;
    }

    public async fetch(url: string, options: { element: HTMLElement }): Promise<Buffer | null> {
        /* istanbul ignore if */
        if (!url) {
            const promise = Promise.resolve(null);

            (promise as any).abort = () => { };

            return await promise;
        }

        const urlAsUrl = new URL(url);
        let resourceUrl: string = urlAsUrl.href;
        const element = options.element ? new JSDOMAsyncHTMLElement(options.element) : null;

        /* istanbul ignore if */
        if (!urlAsUrl.protocol) {
            resourceUrl = new URL(resourceUrl, this._connector.finalHref).href;
        }

        // Ignore if the resource has already been fetched.
        if (this._connector.fetchedHrefs.has(resourceUrl)) {
            return null;
        }

        this._connector.fetchedHrefs.add(resourceUrl);

        debug(`resource ${resourceUrl} to be fetched`);

        let abort: Function;

        const promise = new Promise<Buffer>(async (resolve, reject) => {
            abort = reject;

            await this._connector.server.emitAsync('fetch::start', { resource: resourceUrl });

            try {
                const resourceNetworkData: NetworkData = await this._connector.fetchContent(resourceUrl);

                debug(`resource ${resourceUrl} fetched`);

                const fetchEndEvent: FetchEnd = {
                    element,
                    request: resourceNetworkData.request,
                    resource: resourceNetworkData.response.url,
                    response: resourceNetworkData.response
                };

                const { charset, mediaType } = getContentTypeData(element, fetchEndEvent.resource, fetchEndEvent.response.headers, fetchEndEvent.response.body.rawContent);
                const type = mediaType ? getType(mediaType) : /* istanbul ignore next */ 'unknown';

                fetchEndEvent.response.mediaType = mediaType!;
                fetchEndEvent.response.charset = charset!;

                /*
                 * TODO: Replace `null` with `resource` once it
                 * can be converted to `JSDOMAsyncHTMLElement`.
                 * Event is also emitted when status code in response is not 200.
                 */
                await this._connector.server.emitAsync(`fetch::end::${type}`, fetchEndEvent);

                return resolve(resourceNetworkData.response.body.rawContent);
            } catch (err) {
                const hops: Array<string> = this._connector.request.getRedirects(err.uri);
                const fetchError: FetchError = {
                    element: element!,
                    error: err.error,
                    hops,
                    /* istanbul ignore next */
                    resource: err.uri || resourceUrl
                };

                await this._connector.server.emitAsync('fetch::error', fetchError);

                return reject(fetchError);
            }
        });

        /*
         * When jsdom is close (because of an exception) it will try to close
         * all the pending connections calling to `abort`.
         */
        /* istanbul ignore next */
        (promise as any).abort = () => {
            const error = new Error('request canceled by user');

            abort(error);
        };

        return promise;
    }
}
