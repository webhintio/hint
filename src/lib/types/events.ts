import { IAsyncHTMLElement } from './asynchtml';
import { IRequest, IResponse } from './network';

/** The object emitted when the collector is going to start the process. */
export interface IScanStart {
    /** The URL that is going to be analyzed. */
    resource: string;
}

/** The object emitted when the collector has finished the process. */
export interface IScanEnd {
    /** The final URL analyzed after redirects. */
    resource: string;
}

/** The object emitted by a collector on `targetfetch::start` or `fetch::start`. */
export interface IFetchStart {
    /** The URL to download. */
    resource: string;
}

/** The object emitted by a collector on `targetfetch::end` or `fetch::end`. */
export interface IFetchEnd {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The URL of the target. */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}

export type ITargetFetchEnd = IFetchEnd;
export type ITargetFetchStart = IFetchStart;

/** The object emitted by a collector on `targetfetch::error` or `fetch::error` */
export interface IFetchError {
    /** The URL of the target. */
    resource: string;
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
    /** The redirects performed for the url. */
    hops: Array<string>
}

/** The object emitted by a collector on `traverse::start` */
export interface ITraverseStart {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `traverse::end` */
export interface ITraverseEnd {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `traverse::up` */
export interface ITraverseUp {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `traverse::down` */
export interface ITraverseDown {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `element::<element-type>`. */
export interface IElementFound {
    /** The URI of the resource firing this event. */
    resource: string;
    /** The visited element. */
    element: IAsyncHTMLElement;
}

/** The object emitted by a collector on `manifestfetch::error`. */
export interface IManifestFetchError {
    resource: string;
    /** The error when downloading the manifest.  */
    error: Error
}

/** The object emitted by a collector on `manifestfetch::missing`. */
export interface IManifestFetchMissingEvent {
    /** The URL of the web manifest. */
    resource: string;
}

/** The object emitted by a collector on ` manifestfetch::end`. */
export type IManifestFetchEnd = IFetchEnd;
