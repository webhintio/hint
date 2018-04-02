import * as path from 'path';

import * as cloneDeep from 'lodash.clonedeep';

import { TypeScriptConfig, TypeScriptConfigInvalidJSON, TypeScriptConfigParse, TypeScriptConfigInvalidSchema } from './types';
import { FetchEnd, Parser, SchemaValidationResult } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';
import { validate } from 'sonarwhal/dist/src/lib/utils/schema-validator';
import { finalConfig, ErrorCodes } from 'sonarwhal/dist/src/lib/utils/extends-merger';


export default class TypeScriptConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);

        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        sonarwhal.on('fetch::end::*', this.parseTypeScript.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('parse::typescript-config::error::not-found', {});
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

            await this.sonarwhal.emitAsync('parse::typescript-config::error::schema', event);
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

            try {
                config = finalConfig(config, resource);
            } catch (err) {
                if (err.code === ErrorCodes.circular) {
                    const errorEvent: TypeScriptConfigInvalidJSON = {
                        error: err.message,
                        resource: err.resource
                    };

                    await this.sonarwhal.emitAsync('parse::typescript-config::error::circular', errorEvent);
                } else {
                    await this.sonarwhal.emitAsync('parse::typescript-config::error::extends', err);
                }
                config = null;
            }

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

            await this.sonarwhal.emitAsync('parse::typescript-config::end', event);
        } catch (err) {
            const errorEvent: TypeScriptConfigInvalidJSON = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync('parse::typescript-config::error::json', errorEvent);
        }
    }
}
