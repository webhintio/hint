import * as ajv from 'ajv';
import { IEvent } from './events';

export type BabelConfig = {
    ast: boolean;
    auxiliaryCommentAfter: string;
    auxiliaryCommentBefore: string;
    code: boolean;
    comments: boolean;
    compact: string;
    env: object;
    extends: string;
    filename: string;
    filenameRelative: string;
    highlightCode: boolean;
    ignore: Array<string> | string;
    inputSourceMap: object;
    keepModuleIdExtensions: boolean;
    moduleId: string;
    moduleIds: string;
    moduleRoot: string;
    only: Array<string> | string;
    plugins: string | Array<string> | Array<object>;
    presets: string | Array<string> | Array<object>;
    retainLines: boolean;
    sourceFileName: string;
    sourceMaps: string | boolean;
    sourceMapTarget: string;
    sourceRoot: string;
};

// The interfaces below could be combined with typescript config parsers.

export interface IBabelConfigInvalid extends IEvent {
    error: Error;
}

/** The object emitted by the `typescript-config` parser */
export interface IBabelConfigParsed extends IEvent {
    /** The typescript config parsed */
    config: any;
}

export interface IBabelConfigInvalidSchema extends IEvent {
    errors: Array<ajv.ErrorObject>;
}
