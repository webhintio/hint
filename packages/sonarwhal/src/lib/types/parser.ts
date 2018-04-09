import * as path from 'path';

import { merge } from 'lodash';

import { Sonarwhal } from '../sonarwhal';
import { getAsUri } from '../utils/get-as-uri';
import { getAsPathString } from '../utils/get-as-path-string';
import { loadJSONFile } from '../utils/misc';
import { ErrorEvent } from './events'; // eslint-disable-line no-unused-vars

export type ExtendableConfiguration = {
    extends: string;
};

export interface IParserConstructor {
    new(sonarwhal: Sonarwhal): IParser;
}

export interface IParser { }

/** A `Parser` that understands a file content. */
export abstract class Parser implements IParser {
    protected sonarwhal: Sonarwhal;
    protected name: string;

    protected async finalConfig<T extends ExtendableConfiguration, U extends ErrorEvent>(config: T, resource: string): Promise<T> {
        if (!config.extends) {
            return config;
        }

        const configIncludes = new Set();

        let configPath = getAsPathString(getAsUri(resource));

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

                await this.sonarwhal.emitAsync(`parse::${this.name}::error::circular`, errorEvent);

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

                await this.sonarwhal.emitAsync(`parse::${this.name}::error::extends`, error);

                return null;
            }
        }

        return finalConfigJSON;
    }

    /* istanbul ignore next */
    public constructor(sonarwhal: Sonarwhal, parseEventType: string) {
        this.sonarwhal = sonarwhal;
        this.name = parseEventType;
    }
}
