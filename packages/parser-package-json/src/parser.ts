import * as path from 'path';

import { FetchEnd, IJSONResult, Parser, SchemaValidationResult } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { parseJSON } from 'hint/dist/src/lib/utils/json-parser';
import { validate } from 'hint/dist/src/lib/utils/schema-validator';

import { PackageJsonEvents } from './types';
import { IJsonSchemaForNpmPackageJsonFiles } from './schema';

export * from './types';

export default class PackageJsonParser extends Parser<PackageJsonEvents> {
    private schema: IJsonSchemaForNpmPackageJsonFiles;

    public constructor(engine: Engine<PackageJsonEvents>) {
        super(engine, 'package-json');
        // JSON Schema from http://json.schemastore.org/package
        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        // package.json => type: 'json' (file type from extention).
        engine.on('fetch::end::json', this.parsePackageJson.bind(this));
    }

    private validateSchema(config: IJsonSchemaForNpmPackageJsonFiles, resource: string, result: IJSONResult): SchemaValidationResult {
        return validate(this.schema, config, result.getLocation);
    }

    private async emitInvalidPackageJson (validationResult: SchemaValidationResult, resource: string): Promise<void> {
        await this.engine.emitAsync('parse::error::package-json::schema', {
            error: new Error('Invalid package.json configuration'),
            errors: validationResult.errors,
            prettifiedErrors: validationResult.prettifiedErrors,
            resource
        });
    }

    private async parsePackageJson(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;
        const resourceFileName = path.basename(resource);
        const isPackageJson: boolean = resourceFileName === 'package.json';

        if (!isPackageJson) {
            return;
        }

        try {
            const response = fetchEnd.response;
            const result = parseJSON(response.body.content);

            await this.engine.emitAsync('parse::start::package-json', { resource });

            const config: IJsonSchemaForNpmPackageJsonFiles = result.data;

            const validationResult: SchemaValidationResult = await this.validateSchema(config, resource, result);

            if (!validationResult.valid) {
                await this.emitInvalidPackageJson(validationResult, resource);

                return;
            }

            await this.engine.emitAsync('parse::end::package-json', {
                config: validationResult.data,
                getLocation: result.getLocation,
                resource
            });
        } catch (err) {
            await this.engine.emitAsync('parse::error::package-json::json', {
                error: err,
                resource
            });
        }
    }
}
