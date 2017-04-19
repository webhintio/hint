import * as path from 'path';

import test from 'ava';

import { loadJSFile, loadJSONFile } from '../../../../src/lib/utils/file-loader';

const resolve = (route) => {
    return path.join(__dirname, route);
};

test('loadJSFile throws an exception if missing file', (t) => {
    try {
        loadJSFile(resolve('./fixtures/dontexists.js'));
    } catch (e) {
        console.log(e.message);
        t.pass('Throws expected exception');
    }
});

test('loadJSFile throws an exception if invalid JS file', (t) => {
    try {
        loadJSFile(resolve('./fixtures/fixture.json'));
    } catch (e) {
        console.log(e.message);
        t.pass('Throws expected exception');
    }
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
    try {
        loadJSONFile(resolve('./fixture/dontexists.json'));
    } catch (e) {
        t.pass('Throws expected exception');
    }
});

test('loadJSONFile throws an exception if invalid JSON file', (t) => {
    try {
        loadJSONFile(resolve('./fixture/fixture.js'));
    } catch (e) {
        t.pass('Throws expected exception');
    }
});

test('loadJSONFile loads a valid JSON file', (t) => {
    try {
        const a = loadJSONFile(resolve('./fixtures/fixture.json'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});
