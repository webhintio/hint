/**
 * @fileoverview `typescript-config-is-valid` warns again providing an invalid typescript configuration file `tsconfig.json`.
 */
import * as path from 'path';

import * as ajv from 'ajv';
import * as without from 'lodash.without';
import * as groupBy from 'lodash.groupby';
import * as map from 'lodash.map';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { loadJSONFile } from 'sonarwhal/dist/src/lib/utils/misc';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

import { TypeScriptConfigInvalid, TypeScriptConfigParse, TypeScriptConfig } from '@sonarwhal/parser-typescript-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigIsValid implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.interoperability,
            description: '`typescript-config-is-valid` warns again providing an invalid typescript configuration file `tsconfig.json`'
        },
        id: 'typescript-config/is-valid',
        schema: [],
        scope: RuleScope.local
    }

    private schema;

    /*
     * If we want to use the ajv types in TypeScript, we need to import
     * ajv in a lowsercase variable 'ajv', otherwhite, we can't use types
     * like `ajv.Ajv'.
     */
    private validator: ajv.Ajv;

    public constructor(context: RuleContext) {
        this.schema = loadJSONFile(path.join(__dirname, 'schema', 'tsConfigSchema.json'));
        this.validator = new ajv({ // eslint-disable-line new-cap
            $data: true,
            allErrors: true,
            schemaId: 'id',
            verbose: true
        });
        this.validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

        /**
         * Returns a readable error for 'additionalProperty' errors.
         */
        const generateAdditionalPropertiesError = (error: ajv.ErrorObject): string => {
            const property = error.dataPath.substr(1);
            const additionalProperty = (error.params as ajv.AdditionalPropertiesParams).additionalProperty;

            return `'${property}' ${error.message}. Additional property found '${additionalProperty}'.`;
        };

        /**
         * Returns a readable error for 'enum' errors.
         */
        const generateEnumError = (error: ajv.ErrorObject): string => {
            const property = error.dataPath.substr(1);
            const allowedValues = (error.params as ajv.EnumParams).allowedValues;

            return `'${property}' ${error.message} '${allowedValues.join(', ')}'. Value found '${error.data}'`;
        };

        /**
         * Returns a readable error for 'pattern' errors.
         */
        const generatePatternError = (error: ajv.ErrorObject) => {
            const property = error.dataPath.substr(1);

            return `'${property}' ${error.message.replace(/"/g, '\'')}. Value found '${error.data}'`;
        };

        /**
         * Returns a readable error message.
         */
        const prettyfy = (error: ajv.ErrorObject): string => {
            let result: string;

            switch (error.keyword) {
                case 'additionalProperties':
                    result = generateAdditionalPropertiesError(error);
                    break;
                case 'enum':
                    result = generateEnumError(error);
                    break;
                case 'pattern':
                    result = generatePatternError(error);
                    break;
                /* istanbul ignore next */
                default:
                    result = error.message;
                    break;
            }

            return result;
        };

        /**
         * Report all the validation errors received.
         */
        const report = async (errors: Array<ajv.ErrorObject>, resource: string) => {
            for (const error of errors) {
                /*
                 * When some of the errors are 'anyOf' we need to build the message
                 * with the other errors.
                 */
                if (error.keyword === 'anyOf') {
                    const otherErrors = without(errors, error);

                    const results = otherErrors.map((otherError) => {
                        return prettyfy(otherError);
                    });

                    await context.report(resource, null, results.join(' or '));
                } else {
                    await context.report(resource, null, prettyfy(error));
                }
            }
        };

        const invalidJSONFile = async (typeScriptConfigInvalid: TypeScriptConfigInvalid) => {
            const { error, resource } = typeScriptConfigInvalid;

            debug(`invalid-json::typescript-config received`);

            await context.report(resource, null, error.message);
        };

        const validateSchema = (config: TypeScriptConfig) => {

            const validate = this.validator.compile(this.schema);

            const valid = validate(config);

            if (!valid) {
                return validate.errors;
            }

            return [];
        };

        const validate = async (fetchEnd: TypeScriptConfigParse) => {
            const { config, resource } = fetchEnd;

            debug(`parse::typescript-config received`);

            const errors = validateSchema(config);

            const grouped = groupBy(errors, 'dataPath');

            const promises = map(grouped, (values: Array<ajv.ErrorObject>) => {
                return report(values, resource);
            });

            await Promise.all(promises);
        };

        context.on('invalid-json::typescript-config', invalidJSONFile);
        context.on('parse::typescript-config', validate);
    }
}
