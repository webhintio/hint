/**
 * @fileoverview `typescript-config-is-valid` warns again providing an invalid typescript configuration file `tsconfig.json`.
 */
import * as ajv from 'ajv';
import * as without from 'lodash.without';
import * as groupBy from 'lodash.groupby';
import * as map from 'lodash.map';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { TypeScriptConfigInvalid, TypeScriptConfigInvalidSchema } from '@sonarwhal/parser-typescript-config/dist/src/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

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
        id: 'typescript-config-is-valid',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {
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

        const invalidSchema = async (fetchEnd: TypeScriptConfigInvalidSchema) => {
            const { errors, resource } = fetchEnd;

            debug(`invalid-schema::typescript-config received`);

            const grouped: _.Dictionary<Array<ajv.ErrorObject>> = groupBy(errors, 'dataPath');

            const promises = map(grouped, (values) => {
                return report(values, resource);
            });

            await Promise.all(promises);
        };

        context.on('invalid-json::typescript-config', invalidJSONFile);
        context.on('invalid-schema::typescript-config', invalidSchema);
    }
}
