/* eslint-disable sort-keys */

import * as path from 'path';

import test from 'ava';
import { Context, GenericTestContext, Macros } from 'ava';

import readFileAsync from '../../../../src/lib/utils/fs/read-file-async';

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


/** AVA macro for readFileAsync regular tests */
const readFileAsyncMacro: Macros<GenericTestContext<Context<any>>> = async (t, context) => {
    const location = path.join(__dirname, `../fixtures/${context.file}`);
    const content = await readFileAsync(location);

    t.is(content, context.content);
};

testContext.forEach((context) => {
    test(`${context.name} - async`, readFileAsyncMacro, context);
});

test('readFileAsync throws exception if not found', async (t) => {
    await t.throws(readFileAsync('idontexist'));
});
