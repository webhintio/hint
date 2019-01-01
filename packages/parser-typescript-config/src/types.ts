import { Event, ErrorEvent, Events } from 'hint/dist/src/lib/types/events';
import { IJSONLocationFunction, ISchemaValidationError } from 'hint/dist/src/lib/types';
import * as TypeScript from 'typescript';

/** TypeScript Configuration */
export type TypeScriptConfig = {
    compilerOptions: TypeScript.CompilerOptions;
    compileOnSave: boolean;
    extends: string;
    files: string[];
    include: string[];
    exclude: string[];
    typeAcquisition: TypeScript.TypeAcquisition;
};

/** Data type sent for Invalid JSON event */
export type TypeScriptConfigInvalidJSON = ErrorEvent;

/** Data type sent for JSON doesn't validate Schema event */
export type TypeScriptConfigInvalidSchema = ErrorEvent & {
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
};

/** Data type sent when the parse starts parsing */
export type TypeScriptConfigParseStart = Event;

/** The object emitted by the `typescript-config` parser */
export type TypeScriptConfigParse = Event & {
    /** The TypeScript config parsed */
    config: TypeScriptConfig;
    /** Find the location of a path within the original JSON source */
    getLocation: IJSONLocationFunction;
    /** The original TypeScript config */
    originalConfig: TypeScriptConfig;
};

export type TypeScriptConfigEvents = Events & {
    'parse::end::typescript-config': TypeScriptConfigParse;
    'parse::error::typescript-config::circular': ErrorEvent;
    'parse::error::typescript-config::extends': ErrorEvent;
    'parse::error::typescript-config::json': TypeScriptConfigInvalidJSON;
    'parse::error::typescript-config::schema': TypeScriptConfigInvalidSchema;
    'parse::start::typescript-config': TypeScriptConfigParseStart;
};
