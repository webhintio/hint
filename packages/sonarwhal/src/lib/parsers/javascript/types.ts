import { Event } from '../../types';

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The source code parsed */
    sourceCode: any;
};
