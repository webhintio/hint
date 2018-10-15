import * as path from 'path';

import { cloneDeep } from 'lodash';

import { FetchEnd, IJSONResult, Parser, SchemaValidationResult } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { parseJSON } from 'hint/dist/src/lib/utils/json-parser';
import { validate } from 'hint/dist/src/lib/utils/schema-validator';

import { BabelConfig, BabelConfigEvents } from './types';

export * from './types';

export default class BabelConfigParser extends Parser<BabelConfigEvents> {
    private schema: any;

    public constructor(engine: Engine<BabelConfigEvents>) {
        super(engine, 'babel-config');
        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        /**
         * package.json => type: 'json' (file type from extention).
         */
        engine.on('fetch::end::json', this.parseBabelConfig.bind(this));
    }

    private async validateSchema(config: BabelConfig, resource: string, result: IJSONResult): Promise<SchemaValidationResult> {
        const validationResult = validate(this.schema, config, result.getLocation);

        const valid = validationResult.valid;

        if (!valid) {
            await this.engine.emitAsync('parse::error::babel-config::schema', {
                error: new Error('Invalid Babel configuration'),
                errors: validationResult.errors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });
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
            let result = parseJSON(response.body.content);

            if (isPackageJson && !result.data.babel) {
                return;
            }

            await this.engine.emitAsync('parse::start::babel-config', { resource });

            // `result.scope('babel')` won't be null since `result.data.babel` was confirmed to exist above.
            result = isPackageJson ? result.scope('babel')! : result;
            config = result.data;

            const originalConfig: BabelConfig = cloneDeep(config);

            const finalConfig = await this.finalConfig<BabelConfig>(config, resource);

            if (!finalConfig) {
                return;
            }

            config = finalConfig;

            const validationResult: SchemaValidationResult = await this.validateSchema(config, resource, result);

            if (!validationResult.valid) {
                return;
            }

            await this.engine.emitAsync('parse::end::babel-config', {
                config: validationResult.data,
                getLocation: result.getLocation,
                originalConfig,
                resource
            });
        } catch (err) {
            await this.engine.emitAsync('parse::error::babel-config::json', {
                error: err,
                resource
            });
        }
    }
}
