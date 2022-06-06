import * as path from 'path';

import merge = require('lodash/merge');

import { asPathString, getAsUri } from '@hint/utils-network';
import { loadJSONFile } from '@hint/utils-fs';

import { ExtendableConfiguration, IParsingError } from './types';

const getParsingError = (errorMsg: string, resource: string, innerException?: any, code?: string) => {
    const error = new Error(errorMsg) as IParsingError;

    error.resource = resource;
    error.code = code;
    error.stack = innerException ? innerException : error.stack;

    return error;
};

export const finalConfig = <T extends ExtendableConfiguration> (config: T, resource: string): T | IParsingError => {
    if (!config.extends) {
        return config;
    }

    const configIncludes = [];

    // `resource` has already been loaded to provide `config` so `getAsUri` won't be null.
    let configPath = asPathString(getAsUri(resource)!);

    /*
     * `configPath` will have the format c:/path or /path
     * depending on what OS we are running sonar.
     * In case that we are running on Windows, we need
     * to normalize the path to c:\path before continue.
     */
    configIncludes.push(path.normalize(configPath));

    let finalConfigJSON: T = merge({}, config);

    while (finalConfigJSON.extends) {
        const lastPath = configPath;
        const configDir = path.dirname(configPath);

        try {
            configPath = require.resolve(finalConfigJSON.extends, { paths: [configDir] });
        } catch (error) {
            const castedError = error as IParsingError;

            if (castedError && castedError.code === 'MODULE_NOT_FOUND') {
                return getParsingError('Parent configuration missing', resource, error, 'MODULE_NOT_FOUND');
            }

            return getParsingError('Unknown error while parsing configuration', resource, error);
        }

        if (configIncludes.includes(configPath)) {
            const originalPathUri = getAsUri(configIncludes[0]);
            const resource = originalPathUri && originalPathUri.toString() || lastPath;

            return getParsingError(`Circular reference found in file ${lastPath}`, resource);
        }

        delete finalConfigJSON.extends;

        try {
            const extendedConfig = loadJSONFile(configPath);

            configIncludes.push(configPath);

            finalConfigJSON = merge({}, extendedConfig, finalConfigJSON);
        } catch (err) {
            const lastPathUri = getAsUri(lastPath);
            const error = err as IParsingError;

            error.resource = lastPathUri && lastPathUri.toString() || lastPath;

            return error;
        }
    }

    return finalConfigJSON;
};
