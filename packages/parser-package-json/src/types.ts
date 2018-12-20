import { Event, ErrorEvent, Events } from 'hint/dist/src/lib/types/events';
import { IJSONLocationFunction, ISchemaValidationError } from 'hint/dist/src/lib/types';
import {IJsonSchemaForNpmPackageJsonFiles} from './schema';

export type PackageJsonInvalidJSON = ErrorEvent;

/** Data type sent when the parse starts parsing */
export type PackageJsonParseStart = Event;

/** The object emitted by the `package-json` parser */
export type PackageJsonParsed = Event & {
    /** The package json parsed */
    config: IJsonSchemaForNpmPackageJsonFiles;
    /** Find the location of a path within the original JSON source */
    getLocation: IJSONLocationFunction;
};

export type PackageJsonInvalidSchema = ErrorEvent & {
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
};

export type PackageJsonEvents = Events & {
    'parse::end::package-json': PackageJsonParsed;
    'parse::error::package-json::json': PackageJsonInvalidJSON;
    'parse::error::package-json::schema': PackageJsonInvalidSchema;
    'parse::start::package-json': PackageJsonParseStart;
};
