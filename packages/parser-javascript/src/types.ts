import { Event } from 'sonarwhal/dist/src/lib/types/events';

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The source code parsed */
    sourceCode: any;

    /** The token count from generated AST */
    tokenCount: number;
};
