import { AST, SourceCode } from 'eslint';

import { HTMLElement } from 'hint/dist/src/lib/types';
import { Event, Events } from 'hint/dist/src/lib/types/events';

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The ast generated from the script */
    ast: AST.Program;
    /** The originating <script> element if the script was inline */
    element: HTMLElement | null;
    /** The source code parsed */
    sourceCode: SourceCode;
};

export type ScriptEvents = Events & {
    'parse::end::javascript': ScriptParse;
    'parse::start::javascript': Event;
};
