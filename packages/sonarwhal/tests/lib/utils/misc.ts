/* eslint sort-keys:0 */

import * as path from 'path';

import test from 'ava';

import { loadJSFile, loadJSONFile, readFileAsync } from '../../../src/lib/utils/misc';

const testContext = [
    {
        name: 'Strips bom',
        file: 'bom.txt',
        content: ''
    },
    {
        name: 'Empty content',
        file: 'empty.txt',
        content: ''
    },
    {
        name: 'Dummy content',
        file: 'dummy.txt',
        content: 'dummy'
    }];

const resolve = (route) => {
    return path.join(__dirname, route);
};

test('loadJSFile throws an exception if missing file', (t) => {
    t.throws(() => {
        loadJSFile(resolve('./fixtures/dontexists.js'));
    });
});

// HACK: With ava 0.19 and node 7.9.0 this test fails even though it throws an exception
test.skip('loadJSFile throws an exception if invalid JS file', (t) => {
    t.throws(() => {
        loadJSFile(resolve('./fixtures/fixture.json'));
    });
});

test('loadJSFile loads a valid JS module', (t) => {
    try {
        const a = loadJSFile(resolve('./fixtures/fixture.js'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});

test('loadJSONFile throws an exception if missing file', (t) => {
    t.throws(() => {
        loadJSONFile(resolve('./fixture/dontexists.json'));
    });
});

test('loadJSONFile throws an exception if invalid JSON file', (t) => {
    t.throws(() => {
        loadJSONFile(resolve('./fixture/fixture.js'));
    });
});

test('loadJSONFile loads a valid JSON file', (t) => {
    try {
        const a = loadJSONFile(resolve('./fixtures/fixture.json'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});


/** AVA macro for readFileAsync regular tests */
const readFileAsyncMacro = async (t, context) => {
    const location = path.join(__dirname, `./fixtures/${context.file}`);
    const content = await readFileAsync(location);

    t.is(content, context.content);
};

testContext.forEach((context) => {
    test(`${context.name} - async`, readFileAsyncMacro, context);
});

test('readFileAsync throws exception if not found', async (t) => {
    await t.throws(readFileAsync('idontexist'));
});
