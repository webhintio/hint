import { IAsyncHTMLElement } from './asynchtml';
import { IRequest, IResponse } from './network';

export interface IEvent {
    /** The URL that emit the event */
    resource: string;
}

/** The object emitted when the collector is going to start the process. */
export interface IScanStart extends IEvent { }

/** The object emitted when the collector has finished the process. */
export interface IScanEnd extends IEvent { }

/** The object emitted by a collector on `targetfetch::start` or `fetch::start`. */
export interface IFetchStart extends IEvent { }

/** The object emitted by a collector on `targetfetch::end` or `fetch::end`. */
export interface IFetchEnd extends IEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}

export interface ITargetFetchEnd extends IFetchEnd { }
export interface ITargetFetchStart extends IFetchStart { }

/** The object emitted by a collector on `targetfetch::error` or `fetch::error` */
export interface IFetchError extends IEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
    /** The redirects performed for the url. */
    hops: Array<string>
}

/** The object emitted by a collector on `traverse::start` */
export interface ITraverseStart extends IEvent { }

/** The object emitted by a collector on `traverse::end` */
export interface ITraverseEnd extends IEvent { }

/** The object emitted by a collector on `traverse::up` */
export interface ITraverseUp extends IEvent { }

/** The object emitted by a collector on `traverse::down` */
export interface ITraverseDown extends IEvent { }

/** The object emitted by a collector on `element::<element-type>`. */
export interface IElementFound extends IEvent {
    /** The visited element. */
    element: IAsyncHTMLElement;
}

/** The object emitted by a collector on `manifestfetch::error`. */
export interface IManifestFetchError extends IEvent {
    /** The error when downloading the manifest.  */
    error: Error
}

/** The object emitted by a collector on `manifestfetch::missing`. */
export interface IManifestFetchMissingEvent extends IEvent { }

/** The object emitted by a collector on ` manifestfetch::end`. */
export interface IManifestFetchEnd extends IFetchEnd { }
