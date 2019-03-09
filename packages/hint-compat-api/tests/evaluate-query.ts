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
        query: '!true'
    },
    {
        expected: true,
        query: '!false'
    },
    {
        expected: false,
        query: '!invalid'
    },
    {
        expected: true,
        query: '#true'
    },
    {
        expected: true,
        query: '#false'
    },
    {
        expected: true,
        query: '#invalid'
    },
    {
        expected: true,
        query: 'true && true'
    },
    {
        expected: false,
        query: 'true && false'
    },
    {
        expected: false,
        query: 'false && true'
    },
    {
        expected: false,
        query: 'false && false'
    },
    {
        expected: true,
        query: 'invalid && true'
    },
    {
        expected: false,
        query: '!invalid && true'
    },
    {
        expected: true,
        query: 'true || true'
    },
    {
        expected: true,
        query: 'true || false'
    },
    {
        expected: true,
        query: 'false || true'
    },
    {
        expected: false,
        query: 'false || false'
    },
    {
        expected: true,
        query: 'invalid || false'
    },
    {
        expected: false,
        query: '!invalid || false'
    },
    {
        expected: false,
        query: 'true && ( true && false) && true'
    },
    {
        expected: true,
        query: 'true && ( true && #( false && false ) ) && true'
    },
    {
        expected: false,
        query: 'true && (!true && true) && true'
    },
    {
        expected: false,
        query: 'true && (true && !(true || false)) && true'
    }
];

queries.forEach(({ query, expected }) => {
    test(`evaluateQuery('${query}') should return ${expected}`, (t) => {
        const actualResult = evaluateQuery(query);

        t.is(actualResult, expected);
    });
});
