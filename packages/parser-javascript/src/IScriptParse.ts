import { IEvent } from 'sonarwhal/dist/src/lib/types/events';

/** The object emitted by the `javascript` parser */
export interface IScriptParse extends IEvent {
    /** The source code parsed */
    sourceCode: any;
}
