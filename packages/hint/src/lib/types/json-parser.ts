import { ProblemLocation } from './problems';

export interface IJSONLocationOptions {
    at?: 'name' | 'value';
}

/**
 * Resolve the location of a JSON object path (defaults to property name).
 * Pass `true` for `atValue` to get the location of the property value instead.
 */
export interface IJSONLocationFunction {
    (path: string, options?: IJSONLocationOptions): ProblemLocation;
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
    getLocation: IJSONLocationFunction;

    /**
     * Get a `JSONResult` scoped to the specified path as its root.
     * @param path The path to the new root (e.g. `foo.bar`)
     */
    scope(path: string): IJSONResult;
}
