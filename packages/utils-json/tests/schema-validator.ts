import test from 'ava';

import { SchemaValidationResult, validate } from '../src';

const baseSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    additionalProperties: false,
    properties: {
        a: {
            default: 'a',
            type: 'string'
        },
        b: {
            anyOf: [
                { enum: ['t', 'e', 's'] },
                { pattern: '^([tT]|[eE]|[sS])' }
            ],
            type: 'string'
        }
    },
    title: 'JSON schema for Web Application manifest files',
    type: 'object'
};

const schemaTypeRequireAndUniqueItems = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    additionalProperties: false,
    properties: {
        d: {
            items: {
                properties: {
                    domain: { type: 'string' },
                    hints: {
                        items: { type: 'string' },
                        type: 'array',
                        uniqueItems: true
                    }
                },
                required: [
                    'domain',
                    'hints'
                ],
                type: 'object'
            },
            type: 'array',
            uniqueItems: true
        }
    },
    title: 'JSON schema for Web Application manifest files',
    type: 'object'
};

type TestData = {
    a?: string;
    b?: string;
    d?: any;
    z?: string;
};

test('validate should generate the right message for an additional property error', (t) => {
    const data: TestData = {
        a: 'b',
        z: 'h'
    };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.deepEqual(data, result.data);
    t.is(result.prettifiedErrors[0], `'root' must NOT have additional properties. Additional property found 'z'.`);
    t.is(result.errors[0].keyword, 'additionalProperties');
    t.is(result.groupedErrors[0].message, `'root' must NOT have additional properties. Additional property found 'z'.`);
    t.deepEqual(result.groupedErrors[0].errors, result.errors);
});

test('validate should generate the right message for a type error', (t) => {
    const data = { a: 1 };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.deepEqual(data, result.data);
    t.is(result.prettifiedErrors[0], `'a' must be 'string'.`);
    t.is(result.errors[0].keyword, 'type');
    t.is(result.groupedErrors[0].message, `'a' must be 'string'.`);
    t.deepEqual(result.groupedErrors[0].errors, result.errors);
});

test('validate should generate the right message for an enum, pattern and anyOf error', (t) => {
    const data: TestData = { b: 'z' };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.is(result.prettifiedErrors.length, 3);
    t.is(result.prettifiedErrors[0], `'b' must be equal to one of the allowed values 't, e, s'. Value found 'z'`);
    t.is(result.prettifiedErrors[1], `'b' must match pattern '^([tT]|[eE]|[sS])'. Value found 'z'`);
    t.is(result.prettifiedErrors[2], `'b' must be equal to one of the allowed values 't, e, s'. Value found 'z' or 'b' must match pattern '^([tT]|[eE]|[sS])'. Value found 'z'`);
    t.is(result.groupedErrors[0].message, `'b' must be equal to one of the allowed values 't, e, s'. Value found '"z"'. Or 'b' must match pattern '^([tT]|[eE]|[sS])'. Value found 'z'`);
    t.deepEqual(result.groupedErrors[0].errors, result.errors);
    t.is(result.errors[0].keyword, 'enum');
    t.is(result.errors[1].keyword, 'pattern');
    t.is(result.errors[2].keyword, 'anyOf');
});

test('validate should return the data with the default values', (t) => {
    const data: TestData = { b: 'e' };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.notDeepEqual(data, result.data);
    t.is(result.data.a, baseSchema.properties.a.default);
});

test('validate should generate the right message for an invalid type', (t) => {
    const dataWrongType: TestData = { d: {} };
    const resultWrongType: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataWrongType);

    t.is(resultWrongType.prettifiedErrors.length, 1);
    t.is(resultWrongType.prettifiedErrors[0], `'d' must be 'array'.`);
    t.is(resultWrongType.groupedErrors[0].message, `'d' must be 'array'.`);
    t.deepEqual(resultWrongType.groupedErrors[0].errors, resultWrongType.errors);
    t.is(resultWrongType.errors[0].keyword, 'type');
});

test('validate should generate the right message for required fields', (t) => {
    const dataRequiredFields: TestData = { d: [{}] };

    const resultRequiredFields: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataRequiredFields);

    t.is(resultRequiredFields.prettifiedErrors.length, 2);
    t.is(resultRequiredFields.prettifiedErrors[0], `'d/0' must have required property 'domain'`);
    t.is(resultRequiredFields.prettifiedErrors[1], `'d/0' must have required property 'hints'`);
    t.is(resultRequiredFields.groupedErrors[0].message, `'d/0' must have required properties 'domain' and 'hints'`);
    t.deepEqual(resultRequiredFields.groupedErrors[0].errors, resultRequiredFields.errors);
    t.is(resultRequiredFields.errors[0].keyword, 'required');
    t.is(resultRequiredFields.errors[1].keyword, 'required');
});

test('validate should generate the right message for duplicate items', (t) => {
    const dataDuplicateItems: TestData = {
        d: [{
            domain: 'www.example.com',
            hints: ['hint1', 'hint1']
        }]
    };

    const resultDuplicateItems: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataDuplicateItems);

    t.is(resultDuplicateItems.prettifiedErrors.length, 1);
    t.is(resultDuplicateItems.prettifiedErrors[0], `'d/0/hints' must NOT have duplicate items (items ## 1 and 0 are identical).`);
    t.is(resultDuplicateItems.groupedErrors[0].message, `'d/0/hints' must NOT have duplicate items (items ## 1 and 0 are identical).`);
    t.deepEqual(resultDuplicateItems.groupedErrors[0].errors, resultDuplicateItems.errors);
    t.is(resultDuplicateItems.errors[0].keyword, 'uniqueItems');
});

test('validate should generate the right message for required fields and duplicate items', (t) => {
    const dataDuplicateItems: TestData = { d: [{ hints: ['hint1', 'hint1'] }] };

    const resultDuplicateItems: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataDuplicateItems);

    t.is(resultDuplicateItems.prettifiedErrors.length, 2);
    t.is(resultDuplicateItems.prettifiedErrors[0], `'d/0' must have required property 'domain'`);
    t.is(resultDuplicateItems.prettifiedErrors[1], `'d/0/hints' must NOT have duplicate items (items ## 1 and 0 are identical).`);
    t.is(resultDuplicateItems.groupedErrors[0].message, `'d/0' must have required property 'domain'`);
    t.is(resultDuplicateItems.groupedErrors[1].message, `'d/0/hints' must NOT have duplicate items (items ## 1 and 0 are identical).`);
    t.deepEqual(resultDuplicateItems.groupedErrors[0].errors, [resultDuplicateItems.errors[0]]);
    t.deepEqual(resultDuplicateItems.groupedErrors[1].errors, [resultDuplicateItems.errors[1]]);
    t.is(resultDuplicateItems.errors[0].keyword, 'required');
    t.is(resultDuplicateItems.errors[1].keyword, 'uniqueItems');
});
