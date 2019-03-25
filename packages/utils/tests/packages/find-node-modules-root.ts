import * as path from 'path';

import test from 'ava';

import { findNodeModulesRoot } from '../../src/packages';

test(`findNodeModulesRoot returns the right path if it is in the root of the package`, (t) => {
    const rootPackagePath = path.join(__dirname, '..', 'fixtures', 'packages');
    const transformed = findNodeModulesRoot(rootPackagePath);
    const expectedPath = path.join(rootPackagePath, 'node_modules');

    t.is(transformed, expectedPath);
});

test(`findNodeModulesRoot returns the right path if it is in a dependency`, (t) => {
    const rootPackagePath = path.join(__dirname, '..', 'fixtures', 'packages', 'node_modules', 'testModule');
    const transformed = findNodeModulesRoot(rootPackagePath);
    const expectedPath = path.join(rootPackagePath, '..');

    t.is(transformed, expectedPath);
});
