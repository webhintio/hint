import test from 'ava';

import { SchemaValidationResult } from '../../../src/lib/types';
import { validate } from '../../../src/lib/utils/schema-validator';

const baseSchema = {
    $schema: 'http://json-schema.org/draft-04/schema#',
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
    $schema: 'http://json-schema.org/draft-04/schema#',
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
    t.is(result.prettifiedErrors[0], `root should NOT have additional properties. Additional property found 'z'.`);
    t.is(result.errors[0].keyword, 'additionalProperties');
});

test('validate should generate the right message for a type error', (t) => {
    const data = { a: 1 };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.deepEqual(data, result.data);
    t.is(result.prettifiedErrors[0], `a should be 'string'.`);
    t.is(result.errors[0].keyword, 'type');
});

test('validate should generate the right message for an enum, pattern and anyOf error', (t) => {
    const data: TestData = { b: 'z' };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.is(result.prettifiedErrors.length, 1);
    t.is(result.prettifiedErrors[0], `b should be equal to one of the allowed values 't, e, s'. Value found '"z"'. Or b should match pattern '^([tT]|[eE]|[sS])'. Value found 'z'`);
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
    t.is(resultWrongType.prettifiedErrors[0], `d should be 'array'.`);
    t.is(resultWrongType.errors[0].keyword, 'type');
});

test('validate should generate the right message for required fields', (t) => {
    const dataRequiredFields: TestData = { d: [{}] };

    const resultRequiredFields: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataRequiredFields);

    t.is(resultRequiredFields.prettifiedErrors.length, 1);
    t.is(resultRequiredFields.prettifiedErrors[0], `d[0] should have required properties 'domain' and 'hints'`);
    t.is(resultRequiredFields.errors[0].keyword, 'required');
    t.is(resultRequiredFields.errors[1].keyword, 'required');
});

test('validate should generate the right message for required fields', (t) => {
    const dataDuplicateItems: TestData = {
        d: [{
            domain: 'www.example.com',
            hints: ['hint1', 'hint1']
        }]
    };

    const resultDuplicateItems: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataDuplicateItems);

    t.is(resultDuplicateItems.prettifiedErrors.length, 1);
    t.is(resultDuplicateItems.prettifiedErrors[0], `d[0].hints should NOT have duplicate items (items ## 1 and 0 are identical).`);
    t.is(resultDuplicateItems.errors[0].keyword, 'uniqueItems');
});

test('validate should generate the right message for required fields and duplicate items', (t) => {
    const dataDuplicateItems: TestData = { d: [{ hints: ['hint1', 'hint1'] }] };

    const resultDuplicateItems: SchemaValidationResult = validate(schemaTypeRequireAndUniqueItems, dataDuplicateItems);

    t.is(resultDuplicateItems.prettifiedErrors.length, 2);
    t.is(resultDuplicateItems.prettifiedErrors[0], `d[0] should have required properties 'domain'`);
    t.is(resultDuplicateItems.prettifiedErrors[1], `d[0].hints should NOT have duplicate items (items ## 1 and 0 are identical).`);
    t.is(resultDuplicateItems.errors[0].keyword, 'required');
    t.is(resultDuplicateItems.errors[1].keyword, 'uniqueItems');
});
