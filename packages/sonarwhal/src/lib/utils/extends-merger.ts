import * as path from 'path';

import { merge } from 'lodash';

import { getAsUri } from './get-as-uri';
import { getAsPathString } from './get-as-path-string';
import { loadJSONFile } from './misc';

export type ExtendableConfiguration = {
    extends: string;
};

export enum ErrorCodes {
    circular = 'circular'
}

export const finalConfig = <T extends ExtendableConfiguration>(config: T, resource: string): T => {
    if (!config.extends) {
        return config;
    }

    const configIncludes = new Set();

    let configPath = getAsPathString(getAsUri(resource));

    configIncludes.add(configPath);
    let finalConfigJSON: T = merge({}, config);

    while (finalConfigJSON.extends) {
        const configDir = path.dirname(configPath);

        configPath = path.resolve(configDir, finalConfigJSON.extends);

        if (configIncludes.has(configPath)) {
            const error = {
                code: ErrorCodes.circular,
                message: `Circular reference found in file ${configPath}`,
                resource
            };

            throw error;
        }

        delete finalConfigJSON.extends;

        const extendedConfig = loadJSONFile(configPath);

        configIncludes.add(configPath);

        finalConfigJSON = merge({}, extendedConfig, finalConfigJSON);
    }

    return finalConfigJSON;
};
