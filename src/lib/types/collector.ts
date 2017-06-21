import * as url from 'url'; // eslint-disable-line no-unused-vars

import { IAsyncHTMLElement } from './asynchtml';
import { INetworkData } from './network';

/** The builder of a Collector */
export interface ICollectorBuilder {
    (sonar, options): ICollector;
}

/** A collector to be used by Sonar */
export interface ICollector {
    /** The original DOM of the resource collected. */
    dom: object;
    /** The original HTML of the resource collected. */
    html: Promise<string>;
    /** The headers from the response if applicable. */
    headers: object;
    /** Collects all the information for the given target. */
    collect(target: url.Url): Promise<any>;
    /** Releases any used resource and/or browser. */
    close(): Promise<void>;
    /** Download an external resource using ` customHeaders` if needed. */
    fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData>;
    /** Evaluates the given JavaScript `code` asynchronously in the target. */
    evaluate(code: string): Promise<any>;
    /** Finds all the nodes that match the given query. */
    querySelectorAll(query: string): Promise<IAsyncHTMLElement[]>
}

export interface ILauncher {
    launch(url: string, options?): Promise<boolean>
}

export type LauncherOptions = { flags?: string[], port?: number };
