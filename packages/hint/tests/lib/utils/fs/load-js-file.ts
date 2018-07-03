import { join } from 'path';

import test from 'ava';

import loadJSFile from '../../../../src/lib/utils/fs/load-js-file';

const resolve = (route) => {
    return join(__dirname, route);
};

test('loadJSFile throws an exception if missing file', (t) => {
    t.throws(() => {
        loadJSFile(resolve('../fixtures/dontexists.js'));
    });
});

test('loadJSFile throws an exception if invalid JS or JSON file', (t) => {
    t.throws(() => {
        loadJSFile(resolve('../fixtures/dummy.txt'));
    });
});

test('loadJSFile loads a valid JS module', (t) => {
    try {
        const a = loadJSFile(resolve('../fixtures/fixture.js'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});
