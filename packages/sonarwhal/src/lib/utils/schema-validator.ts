import * as ajv from 'ajv';
import * as _ from 'lodash';

import { SchemaValidationResult } from '../types';

/*
 * If we want to use the ajv types in TypeScript, we need to import
 * ajv in a lowsercase variable 'ajv', otherwise, we can't use types
 * like `ajv.Ajv'.
 */
const validator = new ajv({ // eslint-disable-line new-cap
    $data: true,
    allErrors: true,
    schemaId: 'id',
    useDefaults: true,
    verbose: true
});

validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

enum ErrorKeyword {
    additionalProperties = 'additionalProperties',
    anyOf = 'anyOf',
    enum = 'enum',
    pattern = 'pattern',
    type = 'type'
}

/**
 * Returns a readable error for 'additionalProperty' errors.
 */
const generateAdditionalPropertiesError = (error: ajv.ErrorObject): string => {
    if (error.keyword !== ErrorKeyword.additionalProperties) {
        return null;
    }

    const property = error.dataPath.substr(1);
    const additionalProperty = (error.params as ajv.AdditionalPropertiesParams).additionalProperty;

    return `'${property}' ${error.message}. Additional property found '${additionalProperty}'.`;
};

/**
 * Returns a readable error for 'enum' errors.
 */
const generateEnumError = (error: ajv.ErrorObject): string => {
    if (error.keyword !== ErrorKeyword.enum) {
        return null;
    }

    const property = error.dataPath.substr(1);
    const allowedValues = (error.params as ajv.EnumParams).allowedValues;

    return `'${property}' ${error.message} '${allowedValues.join(', ')}'. Value found '${error.data}'`;
};

/**
 * Returns a readable error for 'pattern' errors.
 */
const generatePatternError = (error: ajv.ErrorObject) => {
    if (error.keyword !== ErrorKeyword.pattern) {
        return null;
    }

    const property = error.dataPath.substr(1);

    return `'${property}' ${error.message.replace(/"/g, '\'')}. Value found '${error.data}'`;
};

/**
 * Returns a readable error for 'type' errors.
 */
const generateTypeError = (error: ajv.ErrorObject) => {
    if (error.keyword !== ErrorKeyword.type) {
        return null;
    }

    const property = error.dataPath.substr(1);

    return `'${property}' ${error.message.replace(/"/g, '\'')}.`;
};

/**
 * Returns a readable error message.
 */
const generate = (error: ajv.ErrorObject, errors?: Array<ajv.ErrorObject>): string => {
    // eslint-disable-next-line typescript/no-use-before-define, no-use-before-define
    return errorGenerators.reduce((message, generator) => {
        const newErrorMessage: string = generator(error, errors);

        if (newErrorMessage) {
            return newErrorMessage;
        }

        return message;
    }, error.message);
};

/**
 * Returns a readable error for 'anyOf' errors.
 */
const generateAnyOfError = (error: ajv.ErrorObject, errors?: Array<ajv.ErrorObject>): string => {
    if (error.keyword !== 'anyOf') {
        return null;
    }

    const otherErrors = _.without(errors, error);

    const results = otherErrors.map((otherError) => {
        return generate(otherError);
    });

    return results.join(' or ');
};

const errorGenerators: Array<((error: ajv.ErrorObject, errors?: Array<ajv.ErrorObject>) => string)> = [generateAdditionalPropertiesError, generateEnumError, generatePatternError, generateTypeError, generateAnyOfError];

const prettify = (errors: Array<ajv.ErrorObject>) => {
    const grouped: _.Dictionary<Array<ajv.ErrorObject>> = _.groupBy(errors, 'dataPath');

    const result = _.reduce(grouped, (allMessages, groupErrors: Array<ajv.ErrorObject>) => {
        groupErrors.forEach((error) => {
            allMessages.push(generate(error, groupErrors));
        });

        return allMessages;
    }, []);

    return result;
};

export const validate = (schema, json): SchemaValidationResult => {
    // We are clone the incoming data because the validator can modify it.
    const data = _.cloneDeep(json);
    const validateFunction: ajv.ValidateFunction = validator.compile(schema);

    const valid: boolean = validateFunction(data) as boolean;

    return {
        data,
        errors: validateFunction.errors,
        prettifiedErrors: prettify(validateFunction.errors),
        valid
    };
};
