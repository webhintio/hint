import * as path from 'path';

import { cloneDeep } from 'lodash';
import { Engine } from 'hint/dist/src/lib/engine';
import { FetchEnd, IJSONResult, Parser, SchemaValidationResult } from 'hint/dist/src/lib/types';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { parseJSON } from 'hint/dist/src/lib/utils/json-parser';
import { validate } from 'hint/dist/src/lib/utils/schema-validator';

import { TypeScriptConfig, TypeScriptConfigEvents } from './types';

export * from './types';

export default class TypeScriptConfigParser extends Parser<TypeScriptConfigEvents> {
    private schema: any;

    public constructor(engine: Engine<TypeScriptConfigEvents>) {
        super(engine, 'typescript-config');

        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        engine.on('fetch::end::*', this.parseTypeScript.bind(this));
    }

    private async validateSchema(config: TypeScriptConfig, resource: string, result: IJSONResult): Promise<SchemaValidationResult> {
        const validationResult = validate(this.schema, config, result.getLocation);

        const valid = validationResult.valid;

        if (!valid) {
            await this.engine.emitAsync(`parse::error::typescript-config::schema`, {
                error: new Error('Invalid TypeScript configuration'),
                errors: validationResult.errors,
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
         */
        if (!fileName.match(/^tsconfig\.([^.]*\.)?json/gi)) {
            return;
        }

        await this.engine.emitAsync(`parse::start::typescript-config`, { resource });

        let result: IJSONResult;

        try {
            result = parseJSON(fetchEnd.response.body.content);

            const originalConfig = cloneDeep(result.data);

            const config = await this.finalConfig<TypeScriptConfig>(result.data, resource);

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
                originalConfig,
                resource
            });
        } catch (err) {
            await this.engine.emitAsync(`parse::error::typescript-config::json`, {
                error: err,
                resource
            });
        }
    }
}
