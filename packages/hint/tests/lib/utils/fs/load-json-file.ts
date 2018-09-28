import { join } from 'path';

import test from 'ava';

import loadJSONFile from '../../../../src/lib/utils/fs/load-json-file';

const resolve = (route: string) => {
    return join(__dirname, route);
};


test('loadJSONFile throws an exception if missing file', (t) => {
    t.throws(() => {
        loadJSONFile(resolve('../fixture/dontexists.json'));
    });
});

test('loadJSONFile throws an exception if invalid JSON file', (t) => {
    t.throws(() => {
        loadJSONFile(resolve('../fixture/fixture.js'));
    });
});

test('loadJSONFile loads a valid JSON file', (t) => {
    try {
        const a = loadJSONFile(resolve('../fixtures/fixture.json'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});
