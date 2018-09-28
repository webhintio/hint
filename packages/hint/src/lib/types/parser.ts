import * as path from 'path';

import { merge } from 'lodash';

import { Engine } from '../engine';
import { getAsUri } from '../utils/network/as-uri';
import getAsPathString from '../utils/network/as-path-string';
import loadJSONFile from '../utils/fs/load-json-file';
import { ErrorEvent } from './events'; // eslint-disable-line no-unused-vars

export type ExtendableConfiguration = {
    extends: string;
};

export interface IParserConstructor {
    new(engine: Engine): Parser;
}

/** A `Parser` that understands a file content. */
export abstract class Parser {
    protected engine: Engine;
    protected name: string;

    protected async finalConfig<T extends ExtendableConfiguration, U extends ErrorEvent>(config: T, resource: string): Promise<T | null> {
        if (!config.extends) {
            return config;
        }

        const configIncludes = new Set();

        // `resource` has already been loaded to provide `config` so `getAsUri` won't be null.
        let configPath = getAsPathString(getAsUri(resource)!);

        /*
         * `configPath` will have the format c:/path or /path
         * depending on what OS we are running sonar.
         * In case that we are running on Windows, we need
         * to normalize the path to c:\path before continue.
         */
        configIncludes.add(path.normalize(configPath));

        let finalConfigJSON: T = merge({}, config);

        while (finalConfigJSON.extends) {
            const lastPath = configPath;
            const configDir = path.dirname(configPath);

            configPath = path.resolve(configDir, finalConfigJSON.extends);

            if (configIncludes.has(configPath)) {
                const errorEvent: U = {
                    error: new Error(`Circular reference found in file ${lastPath}`),
                    resource
                } as U;

                await this.engine.emitAsync(`parse::${this.name}::error::circular`, errorEvent);

                return null;
            }

            delete finalConfigJSON.extends;

            try {
                const extendedConfig = loadJSONFile(configPath);

                console.log(`adding: ${configPath}`);
                configIncludes.add(configPath);

                finalConfigJSON = merge({}, extendedConfig, finalConfigJSON);
            } catch (err) {
                const error = {
                    error: err,
                    resource
                };

                await this.engine.emitAsync(`parse::${this.name}::error::extends`, error);

                return null;
            }
        }

        return finalConfigJSON;
    }

    /* istanbul ignore next */
    public constructor(engine: Engine, parseEventType: string) {
        this.engine = engine;
        this.name = parseEventType;
    }
}
