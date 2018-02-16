import { IAsyncHTMLElement } from './asynchtml';
import { IRequest, IResponse } from './network';

export interface IEvent {
    /** The URL that emit the event */
    resource: string;
}

/** The object emitted when the connector is going to start the process. */
export interface IScanStart extends IEvent { }

/** The object emitted when the connector has finished the process. */
export interface IScanEnd extends IEvent { }

/** The object emitted by a connector on `fetch::start`. */
export interface IFetchStart extends IEvent { }

/** The object emitted by a connector on `fetch::end::*`. */
export interface IFetchEnd extends IEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The request made to fetch the target. */
    request: IRequest;
    /** The response sent while fetching the target. */
    response: IResponse;
}

/** The object emitted by a connector on `fetch::error` */
export interface IFetchError extends IEvent {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement;
    /** The error found. */
    error: any;
    /** The redirects performed for the url. */
    hops: Array<string>;
}

/** The object emitted by a connector on `traverse::start` */
export interface ITraverseStart extends IEvent { }

/** The object emitted by a connector on `traverse::end` */
export interface ITraverseEnd extends IEvent { }

/** The object emitted by a connector on `traverse::up` */
export interface ITraverseUp extends IEvent {
    /** The parent element that was traversed. */
    element: IAsyncHTMLElement;
}

/** The object emitted by a connector on `traverse::down` */
export interface ITraverseDown extends IEvent {
    /** The parent element to be traversed. */
    element: IAsyncHTMLElement;
}

/** The object emitted by a connector on `element::<element-type>`. */
export interface IElementFound extends IEvent {
    /** The visited element. */
    element: IAsyncHTMLElement;
}

/** The object emitted by a connector on `fetch::error::manifest`. */
export interface IManifestFetchError extends IEvent {
    /** The error when downloading the manifest.  */
    error: Error;
}

/** The object emitted by a connector on `fetch::missing::manifest`. */
export interface IManifestFetchMissing extends IEvent { }

/** The object emitted by the `javascript` parser */
export interface IScriptParse extends IEvent {
    /** The source code parsed */
    sourceCode: any;
}
