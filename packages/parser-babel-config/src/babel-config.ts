import * as path from 'path';
import * as ajv from 'ajv';

import { ScanEnd, FetchEnd, Parser } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';

import { BabelConfig, BabelConfigInvalid, BabelConfigParsed, BabelConfigInvalidSchema } from './types';

export default class BabelConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;
    private validator: ajv.Ajv;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);
        this.schema = loadJSONFile(path.join(__dirname, 'schema', 'babelConfigSchema.json'));

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

        /**
         * .babelrc => type: 'unknown' ('file-type' module doesn't support the type of 'json').
         * package.json => type: 'json' (file type from extention).
         */
        sonarwhal.on('fetch::end::json', this.parseBabelConfig.bind(this));
        sonarwhal.on('fetch::end::unknown', this.parseBabelConfig.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd(scanEnd: ScanEnd) {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('notfound::babel-config', scanEnd);
        }
    }

    private async validateSchema(config: BabelConfig, resource: string) {
        // ajv is lower case to be able to get the types.
        const validate: ajv.ValidateFunction = this.validator.compile(this.schema);
        const valid = validate(config);

        if (!valid) {
            const event: BabelConfigInvalidSchema = {
                errors: validate.errors,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-schema::babel-config', event);
        }

        return valid;
    }

    private async parseBabelConfig(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;
        const resourceFileName = path.basename(resource);
        const isPackageJson: boolean = resourceFileName === 'package.json';
        const isBabelrc: boolean = resourceFileName === '.babelrc';

        if (!isBabelrc && !isPackageJson) {
            return;
        }

        this.configFound = true; // It could be a `package.json` w/o `babel`, which will be verified below.
        let config: BabelConfig;

        try {
            const response = fetchEnd.response;
            // When using local connector to read local files, 'content' is empty.
            const content = JSON.parse(response.body.content || response.body.rawContent.toString());

            if (isPackageJson && !content.babel) {
                this.configFound = false;

                return;
            }

            config = isPackageJson ? content.babel : content;

            const valid = await this.validateSchema(config, resource);

            if (!valid) {
                return;
            }

            const event: BabelConfigParsed = {
                config,
                resource
            };

            await this.sonarwhal.emitAsync('parse::babel-config', event);
        } catch (err) {
            const errorEvent: BabelConfigInvalid = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-json::babel-config', errorEvent);
        }
    }
}
