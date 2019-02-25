import { AST, SourceCode } from 'eslint';

import { IAsyncHTMLElement } from 'hint/dist/src/lib/types';
import { Event, Events } from 'hint/dist/src/lib/types/events';

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The ast generated from the script */
    ast: AST.Program;
    /** The originating <script> element if the script was inline */
    element: IAsyncHTMLElement | null;
    /** The source code parsed */
    sourceCode: SourceCode;
};

export type ScriptEvents = Events & {
    'parse::end::javascript': ScriptParse;
    'parse::start::javascript': Event;
};
