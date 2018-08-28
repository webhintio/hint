import { Event } from 'hint/dist/src/lib/types/events';
import { IAsyncWindow } from 'hint/dist/src/lib/types/async-html';

/** The object emitted by the `html` parser */
export type HTMLParse = Event & {
    /** The raw HTML source code */
    html: string;
    /** An IAsyncWindow containing the IAsyncHTMLDocument generated from the HTML */
    window: IAsyncWindow;
};
