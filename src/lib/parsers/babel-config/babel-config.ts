import * as path from 'path';
import * as ajv from 'ajv';

import { IFetchEnd, Parser, BabelConfig, IBabelConfigInvalid, IBabelConfigParsed, IBabelConfigInvalidSchema } from '../../types';
import { Sonarwhal } from '../../sonarwhal';
import { loadJSONFile } from '../../utils/misc';


export default class BabelConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);


        this.schema = loadJSONFile(path.join(__dirname, 'schema', 'babelConfigSchema.json'));
        sonarwhal.on('fetch::end', this.parseBabelConfig.bind(this));
        sonarwhal.on('targetfetch::end', this.parseBabelConfig.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('notfound::babel-config');
        }
    }

    private async validateSchema(config: BabelConfig, resource: string) {
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
            const event: IBabelConfigInvalidSchema = {
                errors: validate.errors,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-schema::babel-config', event);
        }

        return valid;
    }

    private async parseBabelConfig(fetchEnd: IFetchEnd) {
        const resource = fetchEnd.resource;

        if (!resource.match(/\.?babelrc([^.]*\.)?(json)?$/gi)) {
            // * babelrc.json
            // * .babelrc
            return;
        }

        this.configFound = true;
        let config: BabelConfig;

        try {
            config = JSON.parse(fetchEnd.response.body.content);

            // Validate schema.
            await this.validateSchema(config, resource);

            const event: IBabelConfigParsed = {
                config,
                resource
            };

            // Emit the configuration even if it isn't valid.
            await this.sonarwhal.emitAsync('parse::babel-config', event);
        } catch (err) {
            const errorEvent: IBabelConfigInvalid = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-json::babel-config', errorEvent);
        }
    }
}
