import * as fs from 'fs';

import { hasFile } from './fs';
import type { UserConfig as WebhintUserConfig } from '@hint/utils';
import { type IJSONResult, parseJSON } from '@hint/utils-json';

export class WebhintConfiguratorParser {

    private originalParsedJson: IJSONResult | undefined;
    private userConfig: WebhintUserConfig = {};
    private configFilePath: string | undefined;

    public async initialize(path: string): Promise<IJSONResult | null> {
        this.configFilePath = path;
        const fileExists = await hasFile(this.configFilePath);

        if (!fileExists) {
            // .hintrc does not exists so create one with the default config
            const defaultConfig = { extends: ['development'] };

            await fs.promises.writeFile(this.configFilePath, JSON.stringify(defaultConfig), 'utf-8');
        }

        // user config file is guaranteed to exist at this point, now read it.
        const rawUserConfig = await fs.promises.readFile(this.configFilePath, 'utf-8');

        this.originalParsedJson = parseJSON(rawUserConfig.toString()) as IJSONResult;
        this.userConfig = this.originalParsedJson.data;

        return this.originalParsedJson;
    }

    public async addProblemToIgnoredHintsConfig(hintName: string, problemName: string): Promise<void> {
        if (!this.isInitialized() || (!hintName || !problemName)) {
            return;
        }

        if (!this.userConfig.hints) {
            this.userConfig.hints = {};
        }

        // TODO: support array syntax
        if (Array.isArray(this.userConfig.hints)) {
            throw new Error('Cannot alter hints collection written as an array');
        }

        const hint = this.userConfig.hints[hintName];
        const ignore = { ignore: [problemName] };
        const defaultObject = ['default', ignore];

        if (hint) {
            // hint value is a configuration array e.g "hints": { "compat-api/css": [] }
            if (Array.isArray(hint)) {
                /*
                 * search for the 'ignore' key inside each item, start from position [1] (zero-index based)
                 * as position [0] should always be a severity.
                 */
                for (let i = 1; i < hint.length; i++) {
                    const ignoreProperty = hint[i].ignore;

                    if (ignoreProperty && Array.isArray(ignoreProperty)) {

                        // a list of ignored properties was found, use that one.
                        ignore.ignore = ignoreProperty as [];
                        defaultObject[0] = hint[i - 1];
                        ignore.ignore.push(problemName);
                        break;
                    }
                }
            } else if (typeof hint === 'string') {
                defaultObject[0] = hint;
            }
        }

        Object.defineProperty(this.userConfig.hints, hintName, {
            enumerable: true,
            value: defaultObject,
            writable: true
        });

        await this.saveConfiguration();
    }

    public isInitialized() {
        return !!this.originalParsedJson;
    }

    private async saveConfiguration() {
        const result = JSON.stringify(this.originalParsedJson?.data, null, 2);

        if (this.configFilePath) {
            await fs.promises.writeFile(this.configFilePath, result, 'utf-8');
        }
    }

    private async ignoreHint(hintName: string | undefined, configFilePath: string) {
        if (!this.userConfig || !hintName) {
            return;
        }

        if (!this.userConfig.hints) {
            this.userConfig.hints = {};
        }

        this.userConfig.hints = Object.defineProperty(this.userConfig.hints, hintName, {
            enumerable: true,
            value: 'off',
            writable: true
        });

        await this.saveConfiguration();
    }

    public async ignoreHintPerProject(hintName: string): Promise<void> {

        if (!this.configFilePath) {
            return;
        }

        await this.ignoreHint(hintName, this.configFilePath);
    }
}
