import * as path from 'path';
import * as ajv from 'ajv';

import { ScanEnd, FetchEnd, Parser, SchemaValidationResult } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';
import { validate } from 'sonarwhal/dist/src/lib/utils/schema-validator';

import { BabelConfig, BabelConfigInvalidJSON, BabelConfigParsed, BabelConfigInvalidSchema } from './types';

export default class BabelConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;
    private validator: ajv.Ajv;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);
        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        /**
         * package.json => type: 'json' (file type from extention).
         */
        sonarwhal.on('fetch::end::json', this.parseBabelConfig.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd(scanEnd: ScanEnd) {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('parse::babel-config::error::not-found', scanEnd);
        }
    }

    private async validateSchema(config: BabelConfig, resource: string): Promise<SchemaValidationResult> {
        const validationResult = validate(this.schema, config);

        const valid = validationResult.valid;

        if (!valid) {
            const event: BabelConfigInvalidSchema = {
                errors: validationResult.errors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            };

            await this.sonarwhal.emitAsync('parse::babel-config::error::schema', event);
        }

        return validationResult;
    }

    private async parseBabelConfig(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;
        const resourceFileName = path.basename(resource);
        const isPackageJson: boolean = resourceFileName === 'package.json';
        const isBabelrc: boolean = resourceFileName === '.babelrc';

        if (!isBabelrc && !isPackageJson) {
            return;
        }

        let config: BabelConfig;

        try {
            const response = fetchEnd.response;
            // When using local connector to read local files, 'content' is empty.
            const content = JSON.parse(response.body.content);

            if (isPackageJson && !content.babel) {
                return;
            }

            this.configFound = true;
            config = isPackageJson ? content.babel : content;

            const validationResult: SchemaValidationResult = await this.validateSchema(config, resource);

            if (!validationResult.valid) {
                return;
            }

            const event: BabelConfigParsed = {
                config: validationResult.data,
                originalConfig: config,
                resource
            };

            await this.sonarwhal.emitAsync('parse::babel-config::end', event);
        } catch (err) {
            const errorEvent: BabelConfigInvalidJSON = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync('parse::babel-config::error::json', errorEvent);
        }
    }
}
