import { Event, ErrorEvent } from 'hint/dist/src/lib/types/events';
import { IJSONLocationFunction, ISchemaValidationError } from 'hint/dist/src/lib/types';

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

export type BabelConfigInvalidJSON = ErrorEvent;

/** Data type sent when the parse starts parsing */
export type BabelConfigParseStart = Event;

/** The object emitted by the `babel-config` parser */
export type BabelConfigParsed = Event & {
    /** The babel config parsed */
    config: BabelConfig;
    /** Find the location of a path within the original JSON source */
    getLocation: IJSONLocationFunction;
    /** The original babel config */
    originalConfig: BabelConfig;
};

export type BabelConfigInvalidSchema = Event & {
    errors: Array<ISchemaValidationError>;
    prettifiedErrors: Array<string>;
};
