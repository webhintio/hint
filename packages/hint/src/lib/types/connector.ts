import * as url from 'url';

import { IAsyncHTMLElement } from './async-html';
import { HttpHeaders, NetworkData } from './network';
import { Engine } from '../engine';

export interface IConnectorConstructor {
    new(server: Engine, config?: object, launcher?: ILauncher): IConnector;
}

/** A connector to be used by hint */
export interface IConnector {
    /** The original DOM of the resource collected. */
    dom?: object;
    /** The original HTML of the resource collected. */
    html?: Promise<string>;
    /** The headers from the response if applicable. */
    headers?: HttpHeaders;
    /** Collects all the information for the given target. */
    collect(target: url.URL, options?: IFetchOptions): Promise<any>;
    /** Releases any used resource and/or browser. */
    close(): Promise<void>;
    /** Download an external resource using ` customHeaders` if needed. */
    fetchContent(target: url.URL | string, customHeaders?: object, options?: IFetchOptions): Promise<NetworkData>;
    /** Evaluates the given JavaScript `code` asynchronously in the target. */
    evaluate(code: string): Promise<any>;
    /** Finds all the nodes that match the given query. */
    querySelectorAll(query: string): Promise<Array<IAsyncHTMLElement>>;
}

/** Additional detail for calls to `connect` and `fetchContent` on `IConnector`. */
export interface IFetchOptions {
    /** The content to analyze. Overrides fetching content from the provided target. */
    content?: string;
}

export type BrowserInfo = {
    isNew?: boolean;
    pid: number;
    port?: number;
};

export interface ILauncher {
    launch(url: string, options?: any): Promise<BrowserInfo>;
}

export type LauncherOptions = {
    defaultProfile?: boolean;
    flags?: string[];
    port?: number;
};
