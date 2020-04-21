import test from 'ava';

import { parseJSON } from '../src/parse-json';

test('parseJSON should parse the json', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = parseJSON(JSON.stringify(json, null, 4));

    t.deepEqual(parsedJSON.data, json);
});

test('getLocation should return the right location', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = parseJSON(JSON.stringify(json, null, 4));
    const actualLocation = parsedJSON.getLocation('a');

    t.deepEqual(parsedJSON.data, json);
    t.deepEqual(actualLocation, {
        column: 5,
        line: 1
    });
});

test(`getLocation should return position {0, 0} if it doesn't found the path`, (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = parseJSON(JSON.stringify(json, null, 4));
    const actualLocation = parsedJSON.getLocation('c');

    t.deepEqual(parsedJSON.data, json);
    t.deepEqual(actualLocation, {
        column: 0,
        line: 0
    });
});

test('scope should return the right scope', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = parseJSON(JSON.stringify(json, null, 4));
    const scope = parsedJSON.scope('a');

    t.deepEqual(parsedJSON.data, json);
    t.is(scope!.data, 'a value');
});

test(`scope should return null if it doesn't found the path`, (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = parseJSON(JSON.stringify(json, null, 4));
    const scope = parsedJSON.scope('a.b');

    t.deepEqual(parsedJSON.data, json);
    t.is(scope, null);
});
