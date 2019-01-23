import { Root } from 'postcss';

import { Engine } from 'hint';
import { IAsyncHTMLElement } from 'hint/dist/src/lib/types';
import { Event, Events } from 'hint/dist/src/lib/types/events';

import { StyleEvents } from '../src/parser';

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
};

export type StyleEvents = Events & {
    'parse::end::css': StyleParse;
    'parse::start::css': Event;
};

export type Element = Partial<IAsyncHTMLElement>;

export type PostCss = () => {
    process: (code: string, options: any) => { };
};

export type InterfaceTestContext = {
    postcss: any;
    element: Element;
    engine: Engine<StyleEvents>;
};
