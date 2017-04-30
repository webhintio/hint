import * as url from 'url'; // eslint-disable-line no-unused-vars

import { IAsyncHTMLElement } from './asynchtml';
import { INetworkData } from './network';

/** The builder of a Collector */
export interface ICollectorBuilder {
    (sonar, options): ICollector;
}

/** A collector to be used by Sonar */
export interface ICollector {
    /** The original HTML of the resource collected. */
    html: string;
    /** The headers from the response if applicable. */
    headers: object;
    /** Collects all the information for the given target. */
    collect(target: url.Url): Promise<any>; // TODO: TS doesn't detect correctly `pify` promises
    /** Releases any used resource and/or browser. */
    close(): Promise<void>;
    /** A way for you to make requests if needed. */
    fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData>;
    /** Evaluates the give JavaScript asynchronously in the target. */
    evaluate(source: string): Promise<any>;

    querySelectorAll(source: string): Promise<IAsyncHTMLElement[]>

}
