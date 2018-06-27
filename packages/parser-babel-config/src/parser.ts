import * as path from 'path';

import * as cloneDeep from 'lodash.clonedeep';

import { FetchEnd, Parser, SchemaValidationResult } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal';
import loadJSONFile from 'sonarwhal/dist/src/lib/utils/fs/load-json-file';
import { validate } from 'sonarwhal/dist/src/lib/utils/schema-validator';

import { BabelConfig, BabelConfigInvalidJSON, BabelConfigParsed, BabelConfigInvalidSchema, BabelConfigParseStart } from './types';

export default class BabelConfigParser extends Parser {
    private schema: any;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal, 'babel-config');
        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        /**
         * package.json => type: 'json' (file type from extention).
         */
        sonarwhal.on('fetch::end::json', this.parseBabelConfig.bind(this));
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

            await this.sonarwhal.emitAsync(`parse::${this.name}::error::schema`, event);
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

            const parseStart: BabelConfigParseStart = { resource };

            await this.sonarwhal.emitAsync(`parse::${this.name}::start`, parseStart);

            config = isPackageJson ? content.babel : content;

            const originalConfig: BabelConfig = cloneDeep(config);

            config = await this.finalConfig<BabelConfig, BabelConfigInvalidJSON>(config, resource);

            if (!config) {
                return;
            }

            const validationResult: SchemaValidationResult = await this.validateSchema(config, resource);

            if (!validationResult.valid) {
                return;
            }

            const event: BabelConfigParsed = {
                config: validationResult.data,
                originalConfig,
                resource
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::end`, event);
        } catch (err) {
            const errorEvent: BabelConfigInvalidJSON = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::error::json`, errorEvent);
        }
    }
}
