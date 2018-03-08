import * as path from 'path';

import * as ajv from 'ajv';

import { TypeScriptConfig, TypeScriptConfigInvalid, TypeScriptConfigParse, TypeScriptConfigInvalidSchema } from './types';
import { FetchEnd, Parser } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';

export default class TypeScriptConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;
    private validator: ajv.Ajv;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);

        this.schema = loadJSONFile(path.join(__dirname, 'schema', 'tsConfigSchema.json'));

        /*
         * If we want to use the ajv types in TypeScript, we need to import
         * ajv in a lowsercase variable 'ajv', otherwise, we can't use types
         * like `ajv.Ajv'.
         */
        this.validator = new ajv({ // eslint-disable-line new-cap
            $data: true,
            allErrors: true,
            schemaId: 'id',
            verbose: true
        });

        this.validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

        sonarwhal.on('fetch::end::*', this.parseTypeScript.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('notfound::typescript-config', {});
        }
    }

    private async validateSchema(config: TypeScriptConfig, resource: string) {
        const validate: ajv.ValidateFunction = this.validator.compile(this.schema);

        const valid = validate(config);

        if (!valid) {
            const event: TypeScriptConfigInvalidSchema = {
                errors: validate.errors,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-schema::typescript-config', event);
        }

        return valid;
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

            // Validate if the TypeScript configuration is valid.
            const valid = await this.validateSchema(config, resource);

            if (!valid) {
                return;
            }

            const event: TypeScriptConfigParse = {
                config,
                resource
            };

            await this.sonarwhal.emitAsync('parse::typescript-config', event);
        } catch (err) {
            const errorEvent: TypeScriptConfigInvalid = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-json::typescript-config', errorEvent);
        }
    }
}
