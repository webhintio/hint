import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { cloneDeep } from 'lodash';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { Engine } from 'hint/dist/src/lib/engine';
import { FetchEnd, IJSONResult, Parser, SchemaValidationResult } from 'hint/dist/src/lib/types';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { parseJSON } from 'hint/dist/src/lib/utils/json-parser';
import { validate } from 'hint/dist/src/lib/utils/schema-validator';
import requestAsync from 'hint/dist/src/lib/utils/network/request-async';
import writeFileAsync from 'hint/dist/src/lib/utils/fs/write-file-async';

import { TypeScriptConfig, TypeScriptConfigEvents } from './types';

export * from './types';

const debug = d(__filename);
const oneDay = 3600000 * 24;

export default class TypeScriptConfigParser extends Parser<TypeScriptConfigEvents> {
    private schema: any;
    private schemaUpdated: boolean = false;
    private schemaPath: string = path.join(__dirname, 'schema.json');

    public constructor(engine: Engine<TypeScriptConfigEvents>) {
        super(engine, 'typescript-config');

        this.schema = loadJSONFile(this.schemaPath);

        engine.on('fetch::end::*', this.parseTypeScript.bind(this));
    }

    private async validateSchema(config: TypeScriptConfig, resource: string, result: IJSONResult): Promise<SchemaValidationResult> {
        const validationResult = validate(this.schema, config, result.getLocation);

        const valid = validationResult.valid;

        if (!valid) {
            await this.engine.emitAsync(`parse::error::typescript-config::schema`, {
                error: new Error('Invalid TypeScript configuration'),
                errors: validationResult.errors,
                groupedErrors: validationResult.groupedErrors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });
        }

        return validationResult;
    }

    private compilerOptionsExists(schema: any) {
        return schema.definitions &&
            schema.definitions.compilerOptionsDefinition &&
            schema.definitions.compilerOptionsDefinition.properties &&
            schema.definitions.compilerOptionsDefinition.properties.compilerOptions;
    }

    private typeAcquisitionExists(schema: any) {
        return schema.definitions &&
            schema.definitions.typeAcquisitionDefinition &&
            schema.definitions.typeAcquisitionDefinition.properties &&
            schema.definitions.typeAcquisitionDefinition.properties.typeAcquisition;
    }

    private async getFileStat(file: string): Promise<fs.Stats | null> {
        let stats: fs.Stats | null = null;

        try {
            stats = await promisify(fs.stat)(file);
        } catch (e) {
            debug('Error getting the schema file stats');
            debug(e);
        }

        return stats;
    }

    private async downloadSchema(): Promise<any> {
        let schema: any = null;

        try {
            schema = JSON.parse(await requestAsync('http://json.schemastore.org/tsconfig'));

        } catch (e) {
            debug('Error downloading the schema file');
            debug(e);
        }

        return schema;
    }

    private async updateSchema(): Promise<void> {
        const now = Date.now();

        const schemaStat: fs.Stats | null = await this.getFileStat(this.schemaPath);

        const modified: number = schemaStat ? new Date(schemaStat.mtime).getTime() : Date.now();

        if (!schemaStat || (now - modified > oneDay)) {
            debug('TypeScript Schema is older than 24h.');
            debug('Updating TypeScript Schema');

            const schema = await this.downloadSchema();

            if (this.compilerOptionsExists(schema)) {
                schema.definitions.compilerOptionsDefinition.properties.compilerOptions.additionalProperties = false;
            }

            if (this.typeAcquisitionExists(schema)) {
                schema.definitions.typeAcquisitionDefinition.properties.typeAcquisition.additionalProperties = false;
            }

            this.schema = schema;

            await writeFileAsync(this.schemaPath, JSON.stringify(schema, null, 2));

        }

        this.schemaUpdated = true;
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
        if (!fileName.match(/^tsconfig\.([^.]*\.)?json$/gi)) {
            return;
        }

        await this.engine.emitAsync(`parse::start::typescript-config`, { resource });

        let result: IJSONResult;

        try {
            if (!this.schemaUpdated) {
                await this.updateSchema();
            }

            result = parseJSON(fetchEnd.response.body.content);

            const originalConfig = cloneDeep(result.data);

            const config = await this.finalConfig<TypeScriptConfig>(result.data, resource);

            if (!config) {
                return;
            }

            // Validate if the TypeScript configuration is valid.
            const validationResult = await this.validateSchema(config, resource, result);

            if (!validationResult.valid) {
                return;
            }

            await this.engine.emitAsync(`parse::end::typescript-config`, {
                config: validationResult.data,
                getLocation: result.getLocation,
                originalConfig,
                resource
            });
        } catch (err) {
            await this.engine.emitAsync(`parse::error::typescript-config::json`, {
                error: err,
                resource
            });
        }
    }
}
