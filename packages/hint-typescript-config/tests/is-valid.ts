import * as path from 'path';

import { test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: 'Valid configuration should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        name: `If there is no config file, it should pass`,
        path: path.join(__dirname, 'fixtures', 'noconfig')
    },
    {
        name: 'Invalid JSON should fail',
        path: path.join(__dirname, 'fixtures', 'invalidjson'),
        reports: [{ message: `Unexpected token i in JSON at position 0` }]
    },
    {
        name: 'Invalid schema should fail',
        path: path.join(__dirname, 'fixtures', 'invalidschemaenum'),
        reports: [{
            message: `'compilerOptions.lib[3]' should be equal to one of the allowed values 'es5, es6, es2015, es7, es2016, es2017, es2018, es2019, es2020, esnext, dom, dom.iterable, webworker, webworker.importscripts, scripthost, es2015.core, es2015.collection, es2015.generator, es2015.iterable, es2015.promise, es2015.proxy, es2015.reflect, es2015.symbol, es2015.symbol.wellknown, es2016.array.include, es2017.object, es2017.intl, es2017.sharedmemory, es2017.string, es2017.typedarrays, es2018.asynciterable, es2018.intl, es2018.promise, es2018.regexp, es2019.array, es2019.object, es2019.string, es2019.symbol, es2020.string, es2020.symbol.wellknown, esnext.asynciterable, esnext.array, esnext.bigint, esnext.intl, esnext.symbol'. Value found 'invalidlib'`,
            position: { match: '"invalidlib"' }
        }]
    },
    {
        name: 'If schema has an invalid pattern, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalidschemapattern'),
        reports: [
            {
                message: `'compilerOptions.target' should be equal to one of the allowed values 'es3, es5, es6, es2015, es2016, es2017, es2018, es2019, es2020, esnext'. Value found '"invalid"'. Or 'compilerOptions.target' should match pattern '^([eE][sS]([356]|(20(1[56789]|20))|[nN][eE][xX][tT]))$'. Value found 'invalid'`,
                position: { match: 'target' }
            }
        ]
    },
    {
        name: 'If the configuration has a circular reference, it should fail',
        path: path.join(__dirname, 'fixtures', 'circular'),
        reports: [
            {
                message: `Circular reference found in file ${path.join(__dirname, 'fixtures', 'circular-2', 'tsconfig.circular.json')}`,
                position: { match: 'extends' }
            }
        ]
    },
    {
        name: 'If the configuration has an invalid extends, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalid-extends'),
        reports: [
            {
                message: `Unexpected token i in JSON at position 0`,
                position: { match: 'extends' }
            }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'] });
