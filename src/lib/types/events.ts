import { IAsyncHTMLElement } from './asynchtml';
import { IRequest, IResponse } from './network';

/** The object emited by a collector on `targetfetch::start` or `fetch::start`. */
export interface IFetchStartEvent {
    /** The URL to download. */
    resource: string;
}

/** The object emited by a collector on `targetfetch::end` or `fetch::end`. */
export interface IFetchEndEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The URL of the target. */
    resource: string;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}

/** The object emitted by a collector on `targetfetch::error` or `fetch::error` */
export interface IFetchErrorEvent {
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
export interface ITraverseStartEvent {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `traverse::end` */
export interface ITraverseEndEvent {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `traverse::up` */
export interface ITraverseUpEvent {
    /** The URL of the target. */
    resource: string;
}

/** The object emitted by a collector on `traverse::down` */
export interface ITraverseDownEvent {
    /** The URL of the target. */
    resource: string;
}

/** The object emited by a collector on `element::<element-type>`. */
export interface IElementFoundEvent {
    /** The URI of the resource firing this event. */
    resource: string;
    /** The visited element. */
    element: IAsyncHTMLElement;
}

export interface IManifestFetchErrorEvent {
    resource: string;
    error: Error
}

export type IManifestFetchEnd = IFetchEndEvent;
