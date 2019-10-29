import { GroupedError, Event, ErrorEvent, Events, IJSONLocationFunction, ISchemaValidationError } from 'hint';
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
    groupedErrors: GroupedError[];
    prettifiedErrors: string[];
};

/** Data type sent when the parse starts parsing */
export type TypeScriptConfigParseStart = Event;

/** The object emitted by the `typescript-config` parser */
export type TypeScriptConfigParse = Event & {
    /** The final TypeScript config after adding default values */
    config: TypeScriptConfig;
    /** Find the location of a path within the original JSON source */
    getLocation: IJSONLocationFunction;
    /** The combined TypeScript config after inlining `extends` */
    mergedConfig: TypeScriptConfig;
    /** The original TypeScript config */
    originalConfig: TypeScriptConfig;
};

export type TypeScriptConfigExtendsError = ErrorEvent & {
    getLocation: IJSONLocationFunction;
}

export type TypeScriptConfigEvents = Events & {
    'parse::end::typescript-config': TypeScriptConfigParse;
    'parse::error::typescript-config::extends': TypeScriptConfigExtendsError;
    'parse::error::typescript-config::json': TypeScriptConfigInvalidJSON;
    'parse::error::typescript-config::schema': TypeScriptConfigInvalidSchema;
    'parse::start::typescript-config': TypeScriptConfigParseStart;
};
