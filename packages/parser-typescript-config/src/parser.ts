import * as path from 'path';

import * as cloneDeep from 'lodash.clonedeep';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { FetchEnd, Parser, SchemaValidationResult } from 'sonarwhal/dist/src/lib/types';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';
import { validate } from 'sonarwhal/dist/src/lib/utils/schema-validator';

import { TypeScriptConfig, TypeScriptConfigInvalidJSON, TypeScriptConfigInvalidSchema, TypeScriptConfigParse } from './types';

export default class TypeScriptConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal, 'typescript-config');

        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        sonarwhal.on('fetch::end::*', this.parseTypeScript.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync(`parse::${this.name}::error::not-found`, {});
        }
    }

    private async validateSchema(config: TypeScriptConfig, resource: string): Promise<SchemaValidationResult> {
        const validationResult = validate(this.schema, config);

        const valid = validationResult.valid;

        if (!valid) {
            const event: TypeScriptConfigInvalidSchema = {
                errors: validationResult.errors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::error::schema`, event);
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

        this.configFound = true;
        let config: TypeScriptConfig;

        try {
            config = JSON.parse(fetchEnd.response.body.content);

            const originalConfig = cloneDeep(config);

            config = await this.finalConfig<TypeScriptConfig, TypeScriptConfigInvalidJSON>(config, resource);

            if (!config) {
                return;
            }

            // Validate if the TypeScript configuration is valid.
            const validationResult = await this.validateSchema(config, resource);

            if (!validationResult.valid) {
                return;
            }

            const event: TypeScriptConfigParse = {
                config: validationResult.data,
                originalConfig,
                resource
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::end`, event);
        } catch (err) {
            const errorEvent: TypeScriptConfigInvalidJSON = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::error::json`, errorEvent);
        }
    }
}
