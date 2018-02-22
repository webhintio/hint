import * as path from 'path';
import * as ajv from 'ajv';

import { IScanEnd, IFetchEnd, Parser, BabelConfig, IBabelConfigInvalid, IBabelConfigParsed, IBabelConfigInvalidSchema } from '../../types';
import { Sonarwhal } from '../../sonarwhal';
import { loadJSONFile } from '../../utils/misc';


export default class BabelConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);


        this.schema = loadJSONFile(path.join(__dirname, 'schema', 'babelConfigSchema.json'));
        /**
         * .babelrc => type: 'unknown' ('file-type' module doesn't support the type of 'json').
         * babelrc.json => type: 'json' (file type from extention).
         */
        sonarwhal.on('fetch::end::json', this.parseBabelConfig.bind(this));
        sonarwhal.on('fetch::end::unknown', this.parseBabelConfig.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd(scanEnd: IScanEnd) {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('notfound::babel-config', scanEnd);
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
            // `babelrc.json` or `.babelrc`
            return;
        }

        this.configFound = true;
        let config: BabelConfig;

        try {
            const response = fetchEnd.response;
            // When using local connector to read local files, 'content' is empty.
            const content = response.body.content || response.body.rawContent.toString();

            config = JSON.parse(content);

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
