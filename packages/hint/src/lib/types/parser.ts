import * as path from 'path';

import { merge } from 'lodash';

import { Engine } from '../engine';
import { getAsUri } from '../utils/network/as-uri';
import getAsPathString from '../utils/network/as-path-string';
import loadJSONFile from '../utils/fs/load-json-file';
import { Events } from './events';

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

    protected async finalConfig<T extends ExtendableConfiguration>(config: T, resource: string): Promise<T | null> {
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

                await (this.engine as Engine<Events>).emitAsync(`parse::error::${this.name}::circular` as 'parse::error::*', {
                    error: new Error(`Circular reference found in file ${lastPath}`),
                    resource
                });

                return null;
            }

            delete finalConfigJSON.extends;

            try {
                const extendedConfig = loadJSONFile(configPath);

                console.log(`adding: ${configPath}`);
                configIncludes.add(configPath);

                finalConfigJSON = merge({}, extendedConfig, finalConfigJSON);
            } catch (err) {

                await (this.engine as Engine<Events>).emitAsync(`parse::error::${this.name}::extends` as 'parse::error::*', {
                    error: err,
                    resource
                });

                return null;
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
