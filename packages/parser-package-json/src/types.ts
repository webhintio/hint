import { Event, ErrorEvent, Events } from 'hint/dist/src/lib/types/events';
import { IJSONLocationFunction, ISchemaValidationError } from 'hint/dist/src/lib/types';

export type PackageJsonInvalidJSON = ErrorEvent;

/** Data type sent when the parse starts parsing */
export type PackageJsonParseStart = Event;

/** The object emitted by the `babel-config` parser */
export type PackageJsonParsed = Event & {
    /** The babel config parsed */
    config: any;
    /** Find the location of a path within the original JSON source */
    getLocation: IJSONLocationFunction;
    /** The original babel config */
    originalConfig: any;
};

export type PackageJsonInvalidSchema = ErrorEvent & {
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
};

export type PackageJsonEvents = Events & {
    'parse::end::package-json': PackageJsonParsed;
    'parse::error::package-json::circular': ErrorEvent;
    'parse::error::package-json::extends': ErrorEvent;
    'parse::error::package-json::json': PackageJsonInvalidJSON;
    'parse::error::package-json::schema': PackageJsonInvalidSchema;
    'parse::start::package-json': PackageJsonParseStart;
};
