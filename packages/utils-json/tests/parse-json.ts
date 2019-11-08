import test from 'ava';

import { parseJSON } from '../src/parse-json';
import { ProblemLocation } from '@hint/utils-types';

test('parseJSON should parse the json', (t) => {
    const json = {
        a: 'a value',
        b: 'b value'
    };
    const parsedJSON = parseJSON(JSON.stringify(json, null, 4));
    const actualLocation = parsedJSON.getLocation('a') as ProblemLocation;

    t.deepEqual(parsedJSON.data, json);
    t.deepEqual(actualLocation, {
        column: actualLocation.column,
        line: actualLocation.line
    });
});
