import test from 'ava';

import { evaluateQuery } from '../src/helpers/evaluate-query';

const queries = [
    {
        expected: true,
        query: 'true'
    },
    {
        expected: false,
        query: 'false'
    },
    {
        expected: true,
        query: 'invalid'
    },
    {
        expected: false,
        query: 'nottrue'
    },
    {
        expected: true,
        query: 'notfalse'
    },
    {
        expected: false,
        query: 'notinvalid'
    },
    {
        expected: true,
        query: 'selectortrue'
    },
    {
        expected: true,
        query: 'selector true'
    },
    {
        expected: true,
        query: 'selector(true)'
    },
    {
        expected: true,
        query: 'selectorfalse'
    },
    {
        expected: true,
        query: 'selector(false)'
    },
    {
        expected: true,
        query: 'selectorinvalid'
    },
    {
        expected: true,
        query: 'true and true'
    },
    {
        expected: false,
        query: 'true and false'
    },
    {
        expected: false,
        query: 'false and true'
    },
    {
        expected: false,
        query: 'false and false'
    },
    {
        expected: true,
        query: 'invalid And true'
    },
    {
        expected: false,
        query: 'notinvalid and true'
    },
    {
        expected: true,
        query: 'true or true'
    },
    {
        expected: true,
        query: 'true or false'
    },
    {
        expected: true,
        query: 'false or true'
    },
    {
        expected: false,
        query: 'false or false'
    },
    {
        expected: true,
        query: 'invalid or false'
    },
    {
        expected: false,
        query: 'notinvalid or false'
    }
];

queries.forEach(({ query, expected }) => {
    test(`evaluateQuery('${query}') should return ${expected}`, (t) => {
        const actualResult = evaluateQuery(query);

        t.is(actualResult, expected);
    });
});
