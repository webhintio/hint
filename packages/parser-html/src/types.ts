import { Event } from 'hint/dist/src/lib/types/events';
import { IAsyncHTMLDocument } from 'hint/dist/src/lib/types/async-html';

/** The object emitted by the `html` parser */
export type HTMLParse = Event & {
    /** The IAsyncHTMLDocument generated from the HTML. */
    document: IAsyncHTMLDocument;
    /** The raw HTML source code */
    html: string;
};
