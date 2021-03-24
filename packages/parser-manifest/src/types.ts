import { FetchEnd, FetchError, FetchStart, Event, ErrorEvent, Events } from 'hint';
import { JSONLocationFunction, ISchemaValidationError, GroupedError } from '@hint/utils-json';
import { Manifest } from './schema';

export * from './schema';

export type ManifestInvalidJSON = ErrorEvent;

export type ManifestInvalidSchema = ErrorEvent & {
    /** The parse errors as returned by ajv. */
    errors: ISchemaValidationError[];
    /** The errors grouped for a better readability. */
    groupedErrors: GroupedError[];
    /** The errors in a more human readable format. */
    prettifiedErrors: string[];
};

export type ManifestParsed = Event & {
    /** Find the location of a path within the original JSON source */
    getLocation: JSONLocationFunction;
    /** The content of manifest parsed */
    parsedContent: Manifest;
};

export type ManifestEvents = Events & {
    'fetch::end::manifest': FetchEnd;
    'fetch::error::manifest': FetchError;
    'fetch::start::manifest': FetchStart;
    'parse::end::manifest': ManifestParsed;
    'parse::error::manifest::schema': ManifestInvalidSchema;
    'parse::error::manifest::json': ManifestInvalidJSON;
    'parse::start::manifest': Event;
};
