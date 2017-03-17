/* eslint sort-keys:0 */
import * as path from 'path';

import test from 'ava';

import { readFile, readFileAsync } from '../../../lib/util/misc';

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

/** AVA macro for readFile regular tests */
const readFileMacro = (t, context) => {
    const location = path.join(__dirname, `../../fixtures/util/misc/${context.file}`);
    const content = readFile(location);

    t.is(content, context.content);
};

/** AVA macro for readFileAsync regular tests */
const readFileAsyncMacro = async (t, context) => {
    const location = path.join(__dirname, `../../fixtures/util/misc/${context.file}`);

    console.log(location);
    const content = await readFileAsync(location);

    t.is(content, context.content);
};

testContext.forEach((context) => {
    test(context.name, readFileMacro, context);
    test(`${context.name} - async`, readFileAsyncMacro, context);
});

test('readFile throws exception if not found', (t) => {
    t.throws(() => {
        readFile('idontexist');
    }, Error);
});

test('readFileAsync throws exception if not found', (t) => {
    t.throws(readFileAsync('idontexist'), Error);
});
