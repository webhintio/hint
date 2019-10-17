import { Requester } from '@hint/utils-connector-tools';
import { ResourceLoader } from 'jsdom';
import { NetworkData } from 'hint';
import { debug as d } from '@hint/utils';

const debug: debug.IDebugger = d(__filename);

export class EvaluateCustomResourceLoader extends ResourceLoader {
    private _requester: Requester;
    private _baseUrl: string;

    public constructor(options: any, url: string) {
        super();

        this._requester = new Requester(options);
        this._baseUrl = url;
    }

    public async fetch(url: string): Promise<Buffer | null> {
        if (!url) {
            const promise = Promise.resolve(null);

            (promise as any).abort = () => { };

            return await promise;
        }

        const urlAsUrl = new URL(url);
        let resourceUrl: string = urlAsUrl.href;

        if (!urlAsUrl.protocol) {
            resourceUrl = new URL(resourceUrl, this._baseUrl).href;
        }

        let abort: Function;

        const promise = new Promise<Buffer>(async (resolve, reject) => {
            abort = reject;

            try {
                const resourceNetworkData: NetworkData = await this._requester.get(resourceUrl);

                debug(`resource ${resourceUrl} fetched`);

                return resolve(resourceNetworkData.response.body.rawContent);
            } catch (err) {
                return reject(err);
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
