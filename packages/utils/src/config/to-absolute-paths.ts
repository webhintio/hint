import * as fs from 'fs';
import * as path from 'path';

import { UserConfig, HintsConfigObject } from '../types/config';

export const toAbsolutePaths = (config: UserConfig | null, configRoot: string): UserConfig | null => {
    if (!config) {
        return null;
    }

    /*
     * We could receive a path to a folder or a file. `dirname` will return different
     * things depending on that. E.g.:
     * * `path.dirname('/config/folder')` will return `/config` and we want `/config/folder`
     * * `path.dirname('/config/folder/file')` will return `/config/folder`
     *
     * This is no good if we want to resolve relatively because we will get incorrect
     * paths. To solve this we have to know if what we are receiving is a file or a
     * folder and adjust accordingly.
     */
    const stat = fs.statSync(configRoot); //eslint-disable-line
    const configPath = stat.isDirectory() ? configRoot : path.dirname(configRoot);

    if (!configPath) {
        return config;
    }

    /**
     * If `value` is a relative path (i.e. it starts with `.`), it transforms it
     * to an absolute path using the `configRoot` folder as the origin to `resolve`.
     */
    const resolve = (value: string): string => {
        if (!value.startsWith('.')) {
            return value;
        }

        return path.resolve(configPath, value);
    };

    // Update the connector value
    if (config.connector) {
        if (typeof config.connector === 'string') {
            config.connector = resolve(config.connector);
        } else {
            config.connector.name = resolve(config.connector.name);
        }
    }

    // Update extends
    if (config.extends) {
        config.extends = config.extends.map(resolve);
    }

    // Update formatters
    if (config.formatters) {
        config.formatters = config.formatters.map(resolve);
    }

    // Update parsers
    if (config.parsers) {
        config.parsers = config.parsers.map(resolve);
    }

    // Update hints
    if (config.hints) {
        const hints = Object.keys(config.hints);

        const transformedHints = hints.reduce((newHints, currentHint) => {
            const newHint = resolve(currentHint);

            newHints[newHint] = (config.hints as HintsConfigObject)[currentHint];

            return newHints;
        }, {} as HintsConfigObject);

        config.hints = transformedHints;
    }

    return config;
};
