import { Event } from 'hint/dist/src/lib/types/events';

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The ast generated from the script */
    ast: any;
    /** The source code parsed */
    sourceCode: any;
};
