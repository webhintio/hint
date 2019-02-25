import { IAsyncHTMLElement } from 'hint/dist/src/lib/types';
import { Event, Events } from 'hint/dist/src/lib/types/events';
import { Root } from 'postcss';

/** The object emitted by the `css` parser */
export type StyleParse = Event & {
    /**
     * The PostCSS AST generated from the stylesheet.
     * Typically the `walk*` APIs will be used for rules.
     * http://api.postcss.org/Container.html#walk
     */
    ast: Root;
    /** The raw stylesheet source code */
    code: string;
    /** The originating <style> element if the CSS was inline */
    element: IAsyncHTMLElement | null;
};

export type StyleEvents = Events & {
    'parse::end::css': StyleParse;
    'parse::start::css': Event;
};
