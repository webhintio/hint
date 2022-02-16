import * as path from 'path';

import { cloneDeep } from 'lodash';

import { loadJSONFile } from '@hint/utils-fs';
import { finalConfig, IJSONResult, parseJSON, SchemaValidationResult, validate } from '@hint/utils-json';
import { Engine, FetchEnd, Parser } from 'hint';

import { TypeScriptConfig, TypeScriptConfigEvents } from './types';

export * from './types';

export default class TypeScriptConfigParser extends Parser<TypeScriptConfigEvents> {
    private schema: any;
    private schemaPath: string = path.join(__dirname, 'schema.json');

    public constructor(engine: Engine<TypeScriptConfigEvents>) {
        super(engine, 'typescript-config');

        this.schema = loadJSONFile(this.schemaPath);

        engine.on('fetch::end::*', this.parseTypeScript.bind(this));
    }

    private async validateSchema(config: TypeScriptConfig, resource: string, result: IJSONResult): Promise<SchemaValidationResult> {
        const validationResult = validate(this.schema, config, result.getLocation);

        const valid = validationResult.valid;

        if (!valid) {
            await this.engine.emitAsync(`parse::error::typescript-config::schema`, {
                error: new Error('Invalid TypeScript configuration'),
                errors: validationResult.errors,
                groupedErrors: validationResult.groupedErrors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });
        }

        return validationResult;
    }

    private async parseTypeScript(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;
        const fileName = path.basename(resource);

        /**
         * Match examples:
         * tsconfig.json
         * tsconfig.improved.json
         * tsconfig.whatever.json
         *
         * Not Match examples:
         * tsconfigimproved.json
         * anythingelse.json
         * tsconfig.schema.json
         */
        if (!fileName.match(/^tsconfig\.([^.]*\.)?json$/gi) || fileName === 'tsconfig.schema.json') {
            return;
        }

        await this.engine.emitAsync(`parse::start::typescript-config`, { resource });

        let result: IJSONResult;

        try {
            result = parseJSON(fetchEnd.response.body.content);

            const originalConfig = cloneDeep(result.data);

            const config = finalConfig<TypeScriptConfig>(result.data, resource);

            if (config instanceof Error) {
                await this.engine.emitAsync(`parse::error::typescript-config::extends`,
                    {
                        error: config,
                        getLocation: result.getLocation,
                        resource: config.resource
                    });

                return;
            }

            if (!config) {
                return;
            }

            // Validate if the TypeScript configuration is valid.
            const validationResult = await this.validateSchema(config, resource, result);

            if (!validationResult.valid) {
                return;
            }

            await this.engine.emitAsync(`parse::end::typescript-config`, {
                config: validationResult.data,
                getLocation: result.getLocation,
                mergedConfig: config,
                originalConfig,
                resource
            });
        } catch (err) {
            await this.engine.emitAsync(`parse::error::typescript-config::json`, {
                error: err as Error,
                resource
            });
        }
    }
}
