import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

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
        reports: [
            {
                message: `Unexpected token i in JSON at position 0`,
                position: { column: -1, line: -1 },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'Invalid schema should fail',
        path: path.join(__dirname, 'fixtures', 'invalidschemaenum'),
        reports: [
            {
                message: `'compilerOptions.lib[3]' should be equal to one of the allowed values 'ES5, ES6, ES7, ES2015, ES2015.Collection, ES2015.Core, ES2015.Generator, ES2015.Iterable, ES2015.Promise, ES2015.Proxy, ES2015.Reflect, ES2015.Symbol.WellKnown, ES2015.Symbol, ES2016, ES2016.Array.Include, ES2017, ES2017.Intl, ES2017.Object, ES2017.SharedMemory, ES2017.String, ES2017.TypedArrays, ES2018, ES2018.AsyncIterable, ES2018.Intl, ES2018.Promise, ES2018.Regexp, ES2019, ES2019.Array, ES2019.Object, ES2019.String, ES2019.Symbol, ES2020, ES2020.BigInt, ES2020.Promise, ES2020.String, ES2020.Symbol.WellKnown, ESNext, ESNext.Array, ESNext.AsyncIterable, ESNext.BigInt, ESNext.Intl, ESNext.Symbol, DOM, DOM.Iterable, ScriptHost, WebWorker, WebWorker.ImportScripts'. Value found '"invalidlib"'. Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]5|[Ee][Ss]6|[Ee][Ss]7$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]2015(\\.([Cc][Oo][Ll][Ll][Ee][Cc][Tt][Ii][Oo][Nn]|[Cc][Oo][Rr][Ee]|[Gg][Ee][Nn][Ee][Rr][Aa][Tt][Oo][Rr]|[Ii][Tt][Ee][Rr][Aa][Bb][Ll][Ee]|[Pp][Rr][Oo][Mm][Ii][Ss][Ee]|[Pp][Rr][Oo][Xx][Yy]|[Rr][Ee][Ff][Ll][Ee][Cc][Tt]|[Ss][Yy][Mm][Bb][Oo][Ll].[Ww][Ee][Ll][Ll][Kk][Nn][Oo][Ww][Nn]|[Ss][Yy][Mm][Bb][Oo][Ll]))?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]2016(\\.[Aa][Rr][Rr][Aa][Yy].[Ii][Nn][Cc][Ll][Uu][Dd][Ee])?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]2017(\\.([Ii][Nn][Tt][Ll]|[Oo][Bb][Jj][Ee][Cc][Tt]|[Ss][Hh][Aa][Rr][Ee][Dd][Mm][Ee][Mm][Oo][Rr][Yy]|[Ss][Tt][Rr][Ii][Nn][Gg]|[Tt][Yy][Pp][Ee][Dd][Aa][Rr][Rr][Aa][Yy][Ss]))?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]2018(\\.([Aa][Ss][Yy][Nn][Cc][Ii][Tt][Ee][Rr][Aa][Bb][Ll][Ee]|[Ii][Nn][Tt][Ll]|[Pp][Rr][Oo][Mm][Ii][Ss][Ee]|[Rr][Ee][Gg][Ee][Xx][Pp]))?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]2019(\\.([Aa][Rr][Rr][Aa][Yy]|[Oo][Bb][Jj][Ee][Cc][Tt]|[Ss][Tt][Rr][Ii][Nn][Gg]|[Ss][Yy][Mm][Bb][Oo][Ll]))?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss]2020(\\.([Bb][Ii][Gg][Ii][Nn][Tt]|[Pp][Rr][Oo][Mm][Ii][Ss][Ee]|[Ss][Tt][Rr][Ii][Nn][Gg]|[Ss][Yy][Mm][Bb][Oo][Ll].[Ww][Ee][Ll][Ll][Kk][Nn][Oo][Ww][Nn]))?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ee][Ss][Nn][Ee][Xx][Tt](\\.([Aa][Rr][Rr][Aa][Yy]|[Aa][Ss][Yy][Nn][Cc][Ii][Tt][Ee][Rr][Aa][Bb][Ll][Ee]|[Bb][Ii][Gg][Ii][Nn][Tt]|[Ii][Nn][Tt][Ll]|[Ss][Yy][Mm][Bb][Oo][Ll]))?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Dd][Oo][Mm](\\.[Ii][Tt][Ee][Rr][Aa][Bb][Ll][Ee])?$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ss][Cc][Rr][Ii][Pp][Tt][Hh][Oo][Ss][Tt]$'. Value found 'invalidlib' Or 'compilerOptions.lib[3]' should match pattern '^[Ww][Ee][Bb][Ww][Oo][Rr][Kk][Ee][Rr](\\.[Ii][Mm][Pp][Oo][Rr][Tt][Ss][Cc][Rr][Ii][Pp][Tt][Ss])?$'. Value found 'invalidlib'`,
                position: { match: '"invalidlib"' },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'If schema has an invalid pattern, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalidschemapattern'),
        reports: [
            {
                message: `'compilerOptions.target' should be equal to one of the allowed values 'ES3, ES5, ES6, ES2015, ES2016, ES2017, ES2018, ES2019, ES2020, ESNext'. Value found '"invalid"'. Or 'compilerOptions.target' should match pattern '^([Ee][Ss]([356]|(20(1[56789]|20))|[Nn][Ee][Xx][Tt]))$'. Value found 'invalid'`,
                position: { match: 'target' },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'If the configuration has a circular reference, it should fail',
        path: path.join(__dirname, 'fixtures', 'circular'),
        reports: [
            {
                message: `Circular reference found in file ${path.join(__dirname, 'fixtures', 'circular-2', 'tsconfig.circular.json')}`,
                position: { match: '"../circular-2/tsconfig.circular.json"' },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'If the configuration has an invalid extends, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalid-extends'),
        reports: [
            {
                message: `Unexpected token i in JSON at position 0`,
                position: { match: '"../invalidjson/tsconfig.json"' },
                severity: Severity.error
            }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'] });
