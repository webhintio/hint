import * as ajv from 'ajv';
import { ProblemLocation } from '@hint/utils-types';

export type JSONLocationOptions = {
    at?: 'name' | 'value';
}

/**
 * Resolve the location of a JSON object path (defaults to property name).
 * Pass `true` for `atValue` to get the location of the property value instead.
 */
export type JSONLocationFunction = {
    (path: string, options?: JSONLocationOptions): ProblemLocation | null;
}

/**
 * Access parsed JSON with location information and scoping options.
 */
export interface IJSONResult {

    /**
     * The raw parsed data (as would be returned by `JSON.parse`).
     */
    data: any;

    /**
     * Resolve the location of a JSON object path (defaults to property name).
     * Pass `true` for `atValue` to get the location of the property value instead.
     */
    getLocation: JSONLocationFunction;

    /**
     * Get a `JSONResult` scoped to the specified path as its root.
     * @param path The path to the new root (e.g. `foo.bar`)
     */
    scope(path: string): IJSONResult | null;
}

export type ExtendableConfiguration = {
    extends?: string;
};

export interface IParsingError extends Error {
    innerException: string;
    resource: string;
    code?: string;
}

export interface ISchemaValidationError extends ajv.ErrorObject {
    location?: ProblemLocation;
}

export type GroupedError = {
    message: string;
    errors: ISchemaValidationError[];
    location?: ProblemLocation;
};

export type SchemaValidationResult = {
    data: any;
    errors: ISchemaValidationError[];
    prettifiedErrors: string[];
    groupedErrors: GroupedError[];
    valid: boolean;
};
