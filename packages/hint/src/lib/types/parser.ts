import * as path from 'path';

import merge = require('lodash/merge');

import { loadJSONFile } from '@hint/utils/dist/src/fs/load-json-file';
import { asPathString } from '@hint/utils/dist/src/network/as-path-string';
import { getAsUri } from '@hint/utils/dist/src/network/as-uri';

import { Engine } from '../engine';
import { Events } from './events';

export interface IParsingError extends Error {
    resource: string;
}

export type ExtendableConfiguration = {
    extends: string;
};

export interface IParserConstructor {
    new(engine: Engine): Parser;
}

/** A `Parser` that understands a file content. */
export abstract class Parser<E extends Events = Events> {
    protected engine: Engine<E>;
    protected name: string;

    protected finalConfig<T extends ExtendableConfiguration>(config: T, resource: string): T | IParsingError {
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

            configPath = path.resolve(configDir, finalConfigJSON.extends);

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

                err.resource = lastPathUri && lastPathUri.toString() || lastPath;

                return err;
            }
        }

        return finalConfigJSON;
    }

    /* istanbul ignore next */
    public constructor(engine: Engine<E>, parseEventType: string) {
        this.engine = engine;
        this.name = parseEventType;
    }
}
