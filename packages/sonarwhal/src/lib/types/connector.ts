import * as url from 'url';

import { IAsyncHTMLElement } from './asynchtml';
import { NetworkData } from './network';
import { Sonarwhal } from '../sonarwhal';

export interface IConnectorConstructor {
    new(server: Sonarwhal, config: object, launcher?: ILauncher): IConnector;
}

/** A connector to be used by sonarwhal */
export interface IConnector {
    /** The original DOM of the resource collected. */
    dom?: object;
    /** The original HTML of the resource collected. */
    html?: Promise<string>;
    /** The headers from the response if applicable. */
    headers?: object;
    /** Collects all the information for the given target. */
    collect(target: url.Url): Promise<any>;
    /** Releases any used resource and/or browser. */
    close(): Promise<void>;
    /** Download an external resource using ` customHeaders` if needed. */
    fetchContent?(target: url.Url | string, customHeaders?: object): Promise<NetworkData>;
    /** Evaluates the given JavaScript `code` asynchronously in the target. */
    evaluate?(code: string): Promise<any>;
    /** Finds all the nodes that match the given query. */
    querySelectorAll?(query: string): Promise<Array<IAsyncHTMLElement>>;
}

export type BrowserInfo = {
    isNew?: boolean;
    pid: number;
    port: number;
};

export interface ILauncher {
    launch(url: string, options?): Promise<BrowserInfo>;
}

export type LauncherOptions = {
    defaultProfile?: boolean;
    flags?: string[];
    port?: number;
};
