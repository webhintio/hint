import * as ajv from 'ajv';
import {
    cloneDeep,
    groupBy,
    reduce,
    without
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
    pattern = 'pattern',
    type = 'type'
}

const generateError = (type: string, action: ((error: ajv.ErrorObject, property: string, errors?: Array<ajv.ErrorObject>) => string)): ((error: ajv.ErrorObject, errors?: Array<ajv.ErrorObject>) => string) => {
    return (error: ajv.ErrorObject, errors: Array<ajv.ErrorObject>): string => {
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

    return `${property ? `'${property}' ` : ''}${property ? error.message : `${error.message[0].toLocaleUpperCase()}${error.message.substr(1)}`}. Additional property found '${additionalProperty}'.`;
});

/**
 * Returns a readable error for 'enum' errors.
 */
const generateEnumError = generateError(ErrorKeyword.enum, (error: ajv.ErrorObject, property: string): string => {
    const allowedValues = (error.params as ajv.EnumParams).allowedValues;

    return `'${property}' ${error.message} '${allowedValues.join(', ')}'. Value found '${error.data}'`;
});

/**
 * Returns a readable error for 'pattern' errors.
 */
const generatePatternError = generateError(ErrorKeyword.pattern, (error: ajv.ErrorObject, property: string) => {
    return `'${property}' ${error.message.replace(/"/g, '\'')}. Value found '${error.data}'`;
});

/**
 * Returns a readable error for 'type' errors.
 */
const generateTypeError = generateError(ErrorKeyword.type, (error: ajv.ErrorObject, property: string) => {
    return `'${property}' ${error.message.replace(/"/g, '\'')}.`;
});

/**
 * Returns a readable error for 'anyOf' errors.
 */
const generateAnyOfError = generateError(ErrorKeyword.anyOf, (error: ajv.ErrorObject, property: string, errors?: Array<ajv.ErrorObject>): string => {
    const otherErrors = without(errors, error);

    const results = otherErrors.map((otherError) => {
        // eslint-disable-next-line typescript/no-use-before-define, no-use-before-define
        return generate(otherError);
    });

    return results.join(' or ');
});

const errorGenerators: Array<((error: ajv.ErrorObject, errors?: Array<ajv.ErrorObject>) => string)> = [generateAdditionalPropertiesError, generateEnumError, generatePatternError, generateTypeError, generateAnyOfError];

/**
 * Returns a readable error message.
 */
const generate = (error: ajv.ErrorObject, errors?: Array<ajv.ErrorObject>): string => {
    return errorGenerators.reduce((message, generator) => {
        const newErrorMessage: string = generator(error, errors);

        if (newErrorMessage) {
            return newErrorMessage;
        }

        return message;
    }, error.message);
};


const prettify = (errors: Array<ajv.ErrorObject>) => {
    const grouped = groupBy(errors, 'dataPath');

    const result = reduce(grouped, (allMessages, groupErrors: Array<ajv.ErrorObject>) => {
        groupErrors.forEach((error) => {
            allMessages.push(generate(error, groupErrors));
        });

        return allMessages;
    }, []);

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

    return { ...error, location: getLocation(path) };
};

export const validate = (schema, json, getLocation?: IJSONLocationFunction): SchemaValidationResult => {
    // We clone the incoming data because the validator can modify it.
    const data = cloneDeep(json);
    const validateFunction: ajv.ValidateFunction = validator.compile(schema);

    const valid: boolean = validateFunction(data) as boolean;

    let errors: ISchemaValidationError[] = validateFunction.errors;

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
