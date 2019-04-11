import { Event, Events } from 'hint/dist/src/lib/types';
import { HTMLDocument } from '@hint/utils/dist/src/dom/html';

/** The object emitted by the `html` parser */
export type HTMLParse = Event & {
    /** The raw HTML source code */
    html: string;
    /** A HTMLDocument generated from the HTML */
    document: HTMLDocument;
};

export type HTMLEvents = Events & {
    'parse::end::html': HTMLParse;
    'parse::start::html': Event;
};
