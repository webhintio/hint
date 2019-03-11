/* eslint-disable sort-keys */

import * as path from 'path';

import anyTest, { Macro, TestInterface, ExecutionContext } from 'ava';

import { readFileAsync } from '../../../../src/lib/utils/fs/read-file-async';

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

type ReadFileAsyncContext = {
    name: string;
    file: string;
    content: string;
};

const test = anyTest as TestInterface<ReadFileAsyncContext>;

/** AVA macro for readFileAsync regular tests */
const readFileAsyncMacro: Macro<[ReadFileAsyncContext], ReadFileAsyncContext> = async (t: ExecutionContext<ReadFileAsyncContext>, context: ReadFileAsyncContext) => {
    const location = path.join(__dirname, `../fixtures/${context.file}`);
    const content = await readFileAsync(location);

    t.is(content, context.content);
};

testContext.forEach((context) => {
    test(`${context.name} - async`, readFileAsyncMacro, context);
});

test('readFileAsync throws exception if not found', async (t) => {
    await t.throwsAsync(readFileAsync('idontexist'));
});
