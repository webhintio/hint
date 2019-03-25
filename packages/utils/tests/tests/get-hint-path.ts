import { normalize } from 'path';

import test from 'ava';

import { getHintPath } from '../../src/test';

/*
 * ------------------------------------------------------------------------------
 * getHintPath tests
 * ------------------------------------------------------------------------------
 */

test('getHintPath - performs a `require.resolve` of the top level of the given path', (t) => {
    // We are looking for the main hint package
    const expected = normalize('dist/src/index.js');
    const hintPath = getHintPath(__filename);

    t.true(hintPath.endsWith(expected), `hintPath doesn't end with expected path:
${hintPath}
${expected}`);
});

test('getHintPath - constructs a path using "../src/{$currentFileName}" if the package is supposed to be multihint', (t) => {
    const expected = normalize('dist/tests/src/get-hint-path.js');
    const hintPath = getHintPath(__filename, true);

    t.true(hintPath.endsWith(expected), `hintPath doesn't end with expected path:
${hintPath}
${expected}`);
});
