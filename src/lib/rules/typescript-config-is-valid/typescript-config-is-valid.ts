/**
 * @fileoverview `typescript-config-is-valid` warns again providing an invalid typescript configuration file `tsconfig.json`.
 */
import * as ajv from 'ajv';
import * as _ from 'lodash';

import { Category } from '../../enums/category';
import { RuleContext } from '../../rule-context';
import { IRule, IRuleBuilder, ITypeScriptConfigInvalid, ITypeScriptConfigInvalidSchema } from '../../types';
import { debug as d } from '../../utils/debug';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
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
                 * When some of the error is 'anyOf' we need to build the message
                 * with the other errors.
                 */
                if (error.keyword === 'anyOf') {
                    const otherErrors = _.without(errors, error);

                    const results = otherErrors.map((otherError) => {
                        return prettyfy(otherError);
                    });

                    await context.report(resource, null, results.join(' or '));
                } else {
                    await context.report(resource, null, prettyfy(error));
                }
            }
        };

        const invalidJSONFile = async (typeScriptConfigInvalid: ITypeScriptConfigInvalid) => {
            const { error, resource } = typeScriptConfigInvalid;

            debug(`Validating rule typescript-config-is-valid`);

            await context.report(resource, null, error.message);
        };

        const invalidSchema = async (fetchEnd: ITypeScriptConfigInvalidSchema) => {
            const { errors, resource } = fetchEnd;

            debug(`Validating rule typescript-config-is-valid`);

            const grouped: _.Dictionary<Array<ajv.ErrorObject>> = _.groupBy(errors, 'dataPath');

            const promises = _.map(grouped, (values) => {
                return report(values, resource);
            });

            await Promise.all(promises);
        };

        return {
            'invalid-json::typescript-config': invalidJSONFile,
            'invalid-schema::typescript-config': invalidSchema
        };
    },
    meta: {
        docs: {
            category: Category.interoperability,
            description: `\`typescript-config-is-valid\` warns again providing an invalid typescript configuration file \`tsconfig.json\``
        },
        recommended: false,
        schema: [],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
