import { Event, ErrorEvent, Events } from 'hint/dist/src/lib/types/events';
import { IJSONLocationFunction, ISchemaValidationError, GroupedError } from 'hint/dist/src/lib/types';

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
    ignore: string[] | string;
    inputSourceMap: object;
    keepModuleIdExtensions: boolean;
    moduleId: string;
    moduleIds: string | boolean;
    moduleRoot: string;
    only: string[] | string;
    plugins: string | string[] | object[];
    presets: string | string[] | object[];
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

export type BabelConfigInvalidSchema = ErrorEvent & {
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
    groupedErrors: GroupedError[];
};

export type BabelConfigEvents = Events & {
    'parse::end::babel-config': BabelConfigParsed;
    'parse::error::babel-config::circular': ErrorEvent;
    'parse::error::babel-config::extends': ErrorEvent;
    'parse::error::babel-config::json': BabelConfigInvalidJSON;
    'parse::error::babel-config::schema': BabelConfigInvalidSchema;
    'parse::start::babel-config': BabelConfigParseStart;
};
