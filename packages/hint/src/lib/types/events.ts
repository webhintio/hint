import { IAsyncHTMLElement } from './async-html';
import { Event } from './event';
import { ElementEvents } from './element-events';
import { Problem } from './problems';
import { Request, Response } from './network';

export * from './event';
export * from './element-events';

export type ErrorEvent = Event & {
    /** The Error that emit the event */
    error: Error;
};

/** The object emitted when the connector is going to start the process. */
export type ScanStart = Event;

/** The object emitted when the connector has finished the process. */
export type ScanEnd = Event;

/** The object emitted on `fetch::end::*`. */
export type FetchEnd = Event & {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement | null;
    /** The request made to fetch the target. */
    request: Request;
    /** The response sent while fetching the target. */
    response: Response;
};

/** The object emitted on `fetch::error::*` */
export type FetchError = Event & {
    /** The element that initiated the request. */
    element: IAsyncHTMLElement | null;
    /** The error found. */
    error: any;
    /** The redirects performed for the url. */
    hops: string[];
};

/** The object emitted on `fetch::start::*`. */
export type FetchStart = Event;

/** The object emitted by a connector on `traverse::start` */
export type TraverseStart = Event;

/** The object emitted by a connector on `traverse::end` */
export type TraverseEnd = Event;

/** The object emitted by a connector on `traverse::up` */
export type TraverseUp = Event & {
    /** The parent element that was traversed. */
    element: IAsyncHTMLElement;
};

/** The object emitted by a connector on `traverse::down` */
export type TraverseDown = Event & {
    /** The parent element to be traversed. */
    element: IAsyncHTMLElement;
};

/** The object emitted by a connector on `can-evaluate` */
export type CanEvaluateScript = Event;

export type Events = {
    'can-evaluate::script': CanEvaluateScript;
    'fetch::end::*': FetchEnd;
    'fetch::end::css': FetchEnd;
    'fetch::end::font': FetchEnd;
    'fetch::end::html': FetchEnd;
    'fetch::end::image': FetchEnd;
    'fetch::end::json': FetchEnd;
    'fetch::end::manifest': FetchEnd;
    'fetch::end::script': FetchEnd;
    'fetch::end::txt': FetchEnd;
    'fetch::end::unknown': FetchEnd;
    'fetch::end::xml': FetchEnd;
    'fetch::error': FetchError;
    'fetch::start': FetchStart;
    'fetch::start::target': FetchStart;
    'parse::*::error': ErrorEvent;
    'print': Problem[];
    'scan::end': ScanEnd;
    'scan::start': ScanStart;
    'traverse::down': TraverseDown;
    'traverse::end': TraverseEnd;
    'traverse::start': TraverseStart;
    'traverse::up': TraverseUp;
} & ElementEvents;
