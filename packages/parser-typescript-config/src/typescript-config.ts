import * as path from 'path';

import * as ajv from 'ajv';

import { TypeScriptConfig, TypeScriptConfigInvalid, TypeScriptConfigParse, TypeScriptConfigInvalidSchema } from './types';
import { FetchEnd, Parser} from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';


export default class TypeScriptConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);


        this.schema = loadJSONFile(path.join(__dirname, 'schema', 'tsConfigSchema.json'));
        sonarwhal.on('fetch::end', this.parseTypeScript.bind(this));
        sonarwhal.on('targetfetch::end', this.parseTypeScript.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('notfound::typescript-config');
        }
    }

    private async validateSchema(config: TypeScriptConfig, resource: string) {
        // ajv is lower case to be able to get the types.
        const x: ajv.Ajv = new ajv({ // eslint-disable-line new-cap
            $data: true,
            allErrors: true,
            schemaId: 'auto',
            verbose: true
        });

        x.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        const validate = x.compile(this.schema);

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

        if (!resource.match(/tsconfig\.([^.]*\.)?json/gi)) {
            return;
        }

        this.configFound = true;
        let config: TypeScriptConfig;

        try {
            config = JSON.parse(fetchEnd.response.body.content);

            // Validate schema.
            await this.validateSchema(config, resource);

            const event: TypeScriptConfigParse = {
                config,
                resource
            };

            // Emit the configuration even if it isn't valid.
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
