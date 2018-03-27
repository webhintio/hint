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

type TestData = {
    a?: string;
    b?: string;
    z?: string;
};

test('validate should generate the right message for an additional property error', (t) => {
    const data: TestData = {
        a: 'b',
        z: 'h'
    };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.deepEqual(data, result.data);
    t.is(result.prettifiedErrors[0], `'' should NOT have additional properties. Additional property found 'z'.`);
    t.is(result.errors[0].keyword, 'additionalProperties');
});

test('validate should generate the right message for a type error', (t) => {
    const data = { a: 1 };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.deepEqual(data, result.data);
    t.is(result.prettifiedErrors[0], `'a' should be string.`);
    t.is(result.errors[0].keyword, 'type');
});

test('validate should generate the right message for an enum, pattern and anyOf error', (t) => {
    const data: TestData = { b: 'z' };

    const result: SchemaValidationResult = validate(baseSchema, data);

    t.is(result.prettifiedErrors[0], `'b' should be equal to one of the allowed values 't, e, s'. Value found 'z'`);
    t.is(result.prettifiedErrors[1], `'b' should match pattern '^([tT]|[eE]|[sS])'. Value found 'z'`);
    t.is(result.prettifiedErrors[2], `'b' should be equal to one of the allowed values 't, e, s'. Value found 'z' or 'b' should match pattern '^([tT]|[eE]|[sS])'. Value found 'z'`);
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
