import * as path from 'path';

import merge = require('lodash/merge');

import { asPathString, getAsUri } from '@hint/utils-network';
import { loadJSONFile } from '@hint/utils-fs';

import { importedRequire } from './export-require';
import { ExtendableConfiguration, IFilePathError, IParsingError } from './types';

export const finalConfig = <T extends ExtendableConfiguration> (config: T, resource: string): T | IParsingError | IFilePathError => {
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
            configPath = importedRequire.resolve(finalConfigJSON.extends, { paths: [configDir] });
        } catch (error) {
            const castedError = error as IFilePathError;

            if (castedError && castedError.code === 'MODULE_NOT_FOUND') {
                return castedError;
            }

            throw error;
        }

        if (configIncludes.includes(configPath)) {

            const error = new Error(`Circular reference found in file ${lastPath}`) as IParsingError;
            const originalPathUri = getAsUri(configIncludes[0]);

            error.resource = originalPathUri && originalPathUri.toString() || lastPath;

            return error;
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
