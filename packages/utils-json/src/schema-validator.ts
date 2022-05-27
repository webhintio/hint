import * as ajv from 'ajv';
import addFormats from 'ajv-formats';
import cloneDeep = require('lodash/cloneDeep');
import forEach = require('lodash/forEach');
import groupBy = require('lodash/groupBy');
import reduce = require('lodash/reduce');
import without = require('lodash/without');

import { GroupedError, JSONLocationFunction, ISchemaValidationError, SchemaValidationResult } from './types';

enum ErrorKeyword {
    additionalProperties = 'additionalProperties',
    anyOf = 'anyOf',
    enum = 'enum',
    oneOf = 'oneOf',
    pattern = 'pattern',
    required = 'required',
    type = 'type',
    uniqueItems = 'uniqueItems'
}

const generateError = (type: string, action: ((error: ajv.ErrorObject, property: string, errors?: ajv.ErrorObject[]) => string)): ((error: ajv.ErrorObject, errors?: ajv.ErrorObject[]) => string | null) => {
    return (error: ajv.ErrorObject, errors?: ajv.ErrorObject[]): string | null => {
        if (error.keyword !== type) {
            return null;
        }

        const property = error.instancePath.substr(1);

        return action(error, property, errors);
    };
};

/**
 * Returns a readable error for 'required' errors.
 */
const generateRequiredError = generateError(ErrorKeyword.required, (error: ajv.ErrorObject, property: string) => {
    return `'${property ? property : 'root'}' ${error.message}`;
});

/**
 * Returns a readable error for 'additionalProperty' errors.
 */
const generateAdditionalPropertiesError = generateError(ErrorKeyword.additionalProperties, (error: ajv.ErrorObject, property: string): string => {
    const additionalProperty = error.params.additionalProperty;

    return `'${property ? property : 'root'}' ${property ? error.message : `${error.message}`}. Additional property found '${additionalProperty}'.`;
});

/**
 * Returns a readable error for 'enum' errors.
 */
const generateEnumError = generateError(ErrorKeyword.enum, (error: ajv.ErrorObject, property: string): string => {
    const allowedValues = error.params.allowedValues;

    return `'${property}' ${error.message} '${allowedValues.join(', ')}'. Value found '${error.data}'`;
});

/**
 * Returns a readable error for 'pattern' errors.
 */
const generatePatternError = generateError(ErrorKeyword.pattern, (error: ajv.ErrorObject, property: string) => {
    return `'${property}' ${error.message && error.message.replace(/"/g, '\'')}. Value found '${error.data}'`;
});

/**
 * Returns a readable error for 'type' errors.
 */
const generateTypeError = generateError(ErrorKeyword.type, (error: ajv.ErrorObject, property: string) => {
    return `'${property}' must be '${error.params.type}'.`;
});

const generateAnyOfError = generateError(ErrorKeyword.anyOf, (error: ajv.ErrorObject, property: string, errors?: ajv.ErrorObject[]): string => {
    const otherErrors = without(errors, error);
    const results = otherErrors.map((otherError) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return generate(otherError);
    });

    return results.join(' or ');
});

const generateUniqueItemError = generateError(ErrorKeyword.uniqueItems, (error: ajv.ErrorObject, property: string) => {
    return `'${property}' ${error.message && error.message.replace(/"/g, '\'')}.`;
});

const getRequiredProperty = (error: ajv.ErrorObject): string => {
    return `'${error.params.missingProperty}'`;
};

const getTypeProperty = (error: ajv.ErrorObject): string => {
    return `'${error.params.type}'`;
};

const getEnumValues = (error: ajv.ErrorObject): string => {
    return `'${error.params.allowedValues.join(', ')}'`;
};

const generateAnyOfMessageRequired = (errors: ajv.ErrorObject[]): string => {
    return `must have required ${errors.length === 1 ? 'property' : 'properties'} ${errors.map(getRequiredProperty).join(' or ')}`;
};

const generateAnyOfMessageType = (errors: ajv.ErrorObject[]): string => {
    return `must be ${errors.map(getTypeProperty).join(' or ')}.`;
};

const generateAnyOfMessageEnum = (errors: ajv.ErrorObject[]): string => {
    return `must be equal to one of the allowed values ${errors.map(getEnumValues).join(' or ')}. Value found '${JSON.stringify(errors[0].data)}'.`;
};

type GenerateAnyOfGroupedMessage = {
    [index: string]: (errors: ajv.ErrorObject[]) => string;
};

const generateAnyOfMessage: GenerateAnyOfGroupedMessage = {
    [ErrorKeyword.required]: generateAnyOfMessageRequired,
    [ErrorKeyword.type]: generateAnyOfMessageType,
    [ErrorKeyword.enum]: generateAnyOfMessageEnum
};

const errorGenerators: Array<((error: ajv.ErrorObject, errors?: ajv.ErrorObject[]) => string | null)> = [generateAdditionalPropertiesError, generateEnumError, generatePatternError, generateTypeError, generateUniqueItemError, generateRequiredError, generateAnyOfError];

/**
 * Returns a readable error message.
 */
const generate = (error: ajv.ErrorObject, errors?: ajv.ErrorObject[]): string | null => {
    return errorGenerators.reduce((message, generator) => {
        const newErrorMessage: string | null = generator(error, errors);

        if (newErrorMessage) {
            return newErrorMessage;
        }

        return message;
    }, error.message || '');
};

/**
 * Returns a readable error for 'anyOf' and 'oneOf' errors.
 * e.g.: 'root' must have required properties 'connector' or 'extends'
 */
const generateAnyOfGroupedError = (error: ajv.ErrorObject, errors?: ajv.ErrorObject[]): string => {
    const otherErrors = without(errors, error);
    const grouped = groupBy(otherErrors, 'keyword');

    const results = reduce(grouped, (allMessages, groupedErrors, keyword) => {
        const instancePath = error.instancePath;

        const messageGenerator = generateAnyOfMessage[keyword];

        if (messageGenerator) {
            allMessages.push(`'${instancePath ? instancePath.substr(1) : 'root'}' ${messageGenerator(groupedErrors)}`);

            return allMessages;
        }

        groupedErrors.forEach((error) => {
            /* istanbul ignore next */
            const errorGenerated = generate(error, groupedErrors) || '';

            /* istanbul ignore else */
            if (errorGenerated) {
                allMessages.push(`${errorGenerated}`);
            }
        });

        return allMessages;
    }, [] as string[]);

    return results.join(' Or ');
};

const generateErrorsMessage = (errors: ajv.ErrorObject[]): string[] => {
    const grouped = groupBy(errors, 'keyword');

    const result = reduce(grouped, (allMessages, groupedErrors, keyword) => {
        if (keyword === ErrorKeyword.required) {
            const instancePath = groupedErrors[0].instancePath;

            allMessages.push(`'${instancePath ? instancePath.substr(1) : 'root'}' must have required ${groupedErrors.length === 1 ? 'property' : 'properties'} ${groupedErrors.map(getRequiredProperty).join(' and ')}`);

            return allMessages;
        }

        groupedErrors.forEach((error) => {
            allMessages.push(generate(error, groupedErrors) || '');
        });

        return allMessages;
    }, [] as string[]);

    return result;
};

/**
 * Group messages with the same data path.
 * e.g.:
 * * Input (only messages):
 * *   - must be equal to one of the allowed values (instancePath: ".hints['axe']")
 * *   - must be number (instancePath: ".hints['axe'])"
 * *   - must be equal to one of the allowed values (instancePath: ".hints['axe']")
 * *   - must have required property 'connector' (instancePath: "")
 * *   - must have required property 'extends' (instancePath: "")
 * *   - must match some schema in anyOf (instancePath: "")
 *
 * * Output (only messages):
 * *   - 'hints['axe']' must be equal to one of the allowed values 'off, warning, error' or '0, 1, 2'. Value found '"notvalid"'. Or 'hints['axe']' must be 'number'.
 * *   - 'root' must have required properties 'connector' or 'extends'
 */
const groupMessages = (errors: ISchemaValidationError[]): GroupedError[] => {
    const grouped = groupBy(errors, 'instancePath');

    const result = reduce(grouped, (allErrors, groupErrors: ISchemaValidationError[]) => {
        let errors = groupErrors;

        const anyOf = groupErrors.find((error) => {
            return error.keyword === ErrorKeyword.anyOf || error.keyword === ErrorKeyword.oneOf;
        });

        if (anyOf) {
            const anyOfErrors = groupErrors.filter((error) => {
                /* istanbul ignore next */
                // TODO: Remove "as any"
                return error.schemaPath.includes(anyOf.schemaPath) || (anyOf.schema as any).some((schema: any) => {
                    return error.schemaPath.includes(schema.$ref);
                });
            });

            errors = without(groupErrors, ...anyOfErrors);

            allErrors.push({
                errors: anyOfErrors,
                location: anyOfErrors[0].location,
                message: generateAnyOfGroupedError(anyOf, anyOfErrors)
            });

            /* istanbul ignore else */
            if (errors.length === 0) {
                return allErrors;
            }
        }

        /*
         * If there is no 'anyOf' error, then join with 'and' the rest of the messages.
         * if they have the same keyword.
         */
        const groupedByLocation = groupBy(errors, (error) => {
            /* istanbul ignore if */
            if (error.location) {
                return `column${error.location.column}row${error.location.column}`;
            }

            return '-';
        });

        forEach(groupedByLocation, (group) => {
            allErrors.push({
                errors: group,
                location: group[0].location,
                message: generateErrorsMessage(group).join(' and ')
            });
        });

        return allErrors;

        // return allMessages;
    }, [] as GroupedError[]);

    return result;
};

/**
 * Add location information to the provided schema error object.
 */
/* istanbul ignore next */
const errorWithLocation = (error: ajv.ErrorObject, getLocation: JSONLocationFunction): ISchemaValidationError => {

    let path = error.instancePath;
    const additionalProperty = error.params && error.params.additionalProperty;

    if (additionalProperty) {
        path = path ? `${path}.${additionalProperty}` : additionalProperty;
    }

    return {
        ...error,
        location: getLocation(path.replace(/'/g, '')) || undefined
    };
};

const prettify = (errors: ajv.ErrorObject[]) => {
    const grouped = groupBy(errors, 'instancePath');

    const result = reduce(grouped, (allMessages, groupErrors: ajv.ErrorObject[]) => {
        groupErrors.forEach((error) => {
            allMessages.push(generate(error, groupErrors) || '');
        });

        return allMessages;
    }, [] as string[]);

    return result;
};

export const validate = (schema: object, json: object, getLocation?: JSONLocationFunction): SchemaValidationResult => {
    /*
     * If we want to use the ajv types in TypeScript, we need to import
     * ajv in a lowsercase variable 'ajv', otherwise, we can't use types
     * like `ajv.Ajv'.
     */
    const validator = new ajv.default({ // eslint-disable-line new-cap
        $data: true,
        allErrors: true,
        logger: false,
        useDefaults: true,
        verbose: true
    } as ajv.Options);

    addFormats(validator);
    validator.addKeyword('regexp');
    validator.addKeyword('markdownDescription');

    // We clone the incoming data because the validator can modify it.
    const data = cloneDeep(json);
    const validateFunction: ajv.ValidateFunction<unknown> = validator.compile(schema);

    const valid: boolean = validateFunction(data) as boolean;

    let errors: ISchemaValidationError[] = validateFunction.errors || [];

    /* istanbul ignore if */
    if (errors && getLocation) {
        errors = errors.map((e) => {
            return errorWithLocation(e, getLocation);
        });
    }

    const prettifiedErrors = prettify(errors);
    const groupedErrors: GroupedError[] = groupMessages(errors);

    return {
        data,
        errors,
        groupedErrors,
        prettifiedErrors,
        valid
    };
};
