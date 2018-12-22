import * as ajv from 'ajv';
import {
    cloneDeep,
    groupBy,
    reduce,
    without,
    Dictionary
} from 'lodash';

import { IJSONLocationFunction, ISchemaValidationError, SchemaValidationResult } from '../types';

/*
 * If we want to use the ajv types in TypeScript, we need to import
 * ajv in a lowsercase variable 'ajv', otherwise, we can't use types
 * like `ajv.Ajv'.
 */
const validator = new ajv({ // eslint-disable-line new-cap
    $data: true,
    allErrors: true,
    logger: false,
    schemaId: 'id',
    useDefaults: true,
    verbose: true
} as ajv.Options);

validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

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

        const property = error.dataPath.substr(1);

        return action(error, property, errors);
    };
};

/**
 * Returns a readable error for 'additionalProperty' errors.
 */
const generateAdditionalPropertiesError = generateError(ErrorKeyword.additionalProperties, (error: ajv.ErrorObject, property: string): string => {
    const additionalProperty = (error.params as ajv.AdditionalPropertiesParams).additionalProperty;

    return `${property ? `${property}` : 'root'} ${property ? error.message : `${error.message}`}. Additional property found '${additionalProperty}'.`;
});

/**
 * Returns a readable error for 'enum' errors.
 */
const generateEnumError = generateError(ErrorKeyword.enum, (error: ajv.ErrorObject, property: string): string => {
    const allowedValues = (error.params as ajv.EnumParams).allowedValues;

    return `${property} ${error.message} '${allowedValues.join(', ')}'. Value found '${error.data}'`;
});

/**
 * Returns a readable error for 'pattern' errors.
 */
const generatePatternError = generateError(ErrorKeyword.pattern, (error: ajv.ErrorObject, property: string) => {
    return `${property} ${error.message && error.message.replace(/"/g, '\'')}. Value found '${error.data}'`;
});

/**
 * Returns a readable error for 'type' errors.
 */
const generateTypeError = generateError(ErrorKeyword.type, (error: ajv.ErrorObject, property: string) => {
    return `${property} should be '${(error.params as ajv.TypeParams).type}'.`;
});

const generateUniqueItemError = generateError(ErrorKeyword.uniqueItems, (error: ajv.ErrorObject, property: string) => {
    return `${property} ${error.message && error.message.replace(/"/g, '\'')}.`;
});

const getRequiredProperty = (error: ajv.ErrorObject): string => {
    return `'${(error.params as ajv.RequiredParams).missingProperty}'`;
};

const getTypeProperty = (error: ajv.ErrorObject): string => {
    return `'${(error.params as ajv.TypeParams).type}'`;
};

const getEnumValues = (error: ajv.ErrorObject): string => {
    return `'${(error.params as ajv.EnumParams).allowedValues.join(', ')}'`;
};

const generateAnyOfMessageRequired = (errrors: ajv.ErrorObject[]): string => {
    return `should have required properties ${errrors.map(getRequiredProperty).join(' or ')}`;
};

const generateAnyOfMessageType = (errors: ajv.ErrorObject[]): string => {
    return `should be ${errors.map(getTypeProperty).join(' or ')}.`;
};

const generateAnyOfMessageEnum = (errors: ajv.ErrorObject[]): string => {
    return `should be equal to one of the allowed values ${errors.map(getEnumValues).join(' or ')}. Value found '${JSON.stringify(errors[0].data)}'.`;
};

type GenerateAnyOfMessage = {
    [index: string]: (errors: ajv.ErrorObject[]) => string;
};

const generateAnyOfMessage: GenerateAnyOfMessage = {
    [ErrorKeyword.required]: generateAnyOfMessageRequired,
    [ErrorKeyword.type]: generateAnyOfMessageType,
    [ErrorKeyword.enum]: generateAnyOfMessageEnum
};

const errorGenerators: Array<((error: ajv.ErrorObject, errors?: ajv.ErrorObject[]) => string | null)> = [generateAdditionalPropertiesError, generateEnumError, generatePatternError, generateTypeError, generateUniqueItemError];

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
 */
const generateAnyOfError = (error: ajv.ErrorObject, errors?: ajv.ErrorObject[]): string => {
    const otherErrors = without(errors, error);
    const grouped = groupBy(otherErrors, 'keyword');

    const results = reduce(grouped, (allMessages, groupedErrors, keyword) => {
        const dataPath = error.dataPath;

        const messageGenerator = generateAnyOfMessage[keyword];

        if (messageGenerator) {
            allMessages.push(`${dataPath ? dataPath.substr(1) : 'root'} ${messageGenerator(groupedErrors)}`);

            return allMessages;
        }

        groupedErrors.forEach((error) => {
            const errorGenerated = generate(error, groupedErrors) || '';

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
            const dataPath = groupedErrors[0].dataPath;

            allMessages.push(`${dataPath ? dataPath.substr(1) : 'root'} should have required properties ${groupedErrors.map(getRequiredProperty).join(' and ')}`);

            return allMessages;
        }

        groupedErrors.forEach((error) => {
            allMessages.push(generate(error, groupedErrors) || '');
        });

        return allMessages;
    }, [] as string[]);

    return result;
};

const prettify = (errors: ajv.ErrorObject[]) => {
    const grouped: Dictionary<ajv.ErrorObject[]> = groupBy(errors, 'dataPath');

    const result = reduce(grouped, (allMessages, groupErrors: ajv.ErrorObject[]) => {
        let errors = groupErrors;

        const anyOf = groupErrors.find((error) => {
            return error.keyword === ErrorKeyword.anyOf || error.keyword === ErrorKeyword.oneOf;
        });

        if (anyOf) {
            const anyOfErrors = groupErrors.filter((error) => {
                return error.schemaPath.includes(anyOf.schemaPath) || anyOf.schema.some((schema: any) => {
                    return error.schemaPath.includes(schema.$ref);
                });
            });

            errors = without(groupErrors, ...anyOfErrors);

            allMessages.push(generateAnyOfError(anyOf, anyOfErrors));


            if (errors.length === 0) {
                return allMessages;
            }
        }

        /*
         * If there is no 'anyOf' error, then join with 'and' the rest of the messages.
         * if they have the same keyword.
         */
        return allMessages.concat(generateErrorsMessage(errors));

        // return allMessages;
    }, [] as string[]);

    return result;
};

/**
 * Add location information to the provided schema error object.
 */
const errorWithLocation = (error: ajv.ErrorObject, getLocation: IJSONLocationFunction): ISchemaValidationError => {

    let path = error.dataPath;
    const additionalProperty = error.params && (error.params as ajv.AdditionalPropertiesParams).additionalProperty;

    if (additionalProperty) {
        path = path ? `${path}.${additionalProperty}` : additionalProperty;
    }

    return Object.assign(error, { location: getLocation(path) || undefined });
};

export const validate = (schema: object, json: object, getLocation?: IJSONLocationFunction): SchemaValidationResult => {
    // We clone the incoming data because the validator can modify it.
    const data = cloneDeep(json);
    const validateFunction: ajv.ValidateFunction = validator.compile(schema);

    const valid: boolean = validateFunction(data) as boolean;

    let errors: ISchemaValidationError[] = validateFunction.errors || [];

    if (errors && getLocation) {
        errors = errors.map((e) => {
            return errorWithLocation(e, getLocation);
        });
    }

    return {
        data,
        errors,
        prettifiedErrors: prettify(errors),
        valid
    };
};
