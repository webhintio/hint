/*
 * This tests has to run serially because we are stubbing require to simulate
 * missing packages.
 */
import * as path from 'path';

import anyTest, { TestInterface } from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';
import * as proxyquire from 'proxyquire';

import * as utils from '@hint/utils';
import { ResourceError } from '@hint/utils/dist/src/types/resource-error';

import { Configuration } from '../../../src/lib/config';
import { ResourceType } from '../../../src/lib/enums/resource-type';
import { ResourceErrorStatus } from '../../../src/lib/enums/error-status';

const installedConnectors = [
    path.join(__dirname, 'fixtures', 'connector1', 'package.json'),
    path.join(__dirname, 'fixtures', 'connector2', 'package.json')
];

type LoadResource = (name: string, type: ResourceType, configurations: string[], verifyVersion: boolean) => any

type ResourceLoaderContext = {
    sandbox: sinon.SinonSandbox;
    loadResource: LoadResource;
}

const test = anyTest as TestInterface<ResourceLoaderContext>;

const loadScript = (context: ResourceLoaderContext) => {
    return proxyquire('../../../src/lib/utils/resource-loader', {
        '@hint/utils': {
            debug: utils.debug,
            fs: utils.fs,
            packages: {
                findNodeModulesRoot: utils.packages.findNodeModulesRoot,
                findPackageRoot: utils.packages.findPackageRoot,
                hasMultipleResources: utils.packages.hasMultipleResources,
                isFullPackageName: utils.packages.isFullPackageName,
                loadResource: context.loadResource,
                requirePackage: utils.packages.requirePackage
            }
        }
    });
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
    t.context.loadResource = (name: string, type: ResourceType, configurations: string[], verifyVersion: boolean) => { };
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('loadHint calls loadResource with the right parameters', (t) => {
    // Using require to allow call loadHint with just 1 parameter.
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource')
        .throws(new ResourceError('message', ResourceErrorStatus.NotFound));
    const resourceLoader = loadScript(t.context);

    t.throws(() => {
        resourceLoader.loadHint('fake-hint');
    });

    t.is(loadResourceStub.firstCall.args[0], 'fake-hint', `The name of the hint isn't correctly passed`);
    t.is(loadResourceStub.firstCall.args[1], 'hint', `The type "hint" isn't used`);
    t.is(typeof loadResourceStub.firstCall.args[2], 'undefined', `loadHint should ignore the version`);
});

test('loadConfiguration calls loadResource with the right parameters', (t) => {
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource')
        .throws(new ResourceError('message', ResourceErrorStatus.NotFound));
    const resourceLoader = loadScript(t.context);

    t.throws(() => {
        resourceLoader.loadConfiguration('fake-configuration');
    });

    t.is(loadResourceStub.firstCall.args[0], 'fake-configuration', `The name of the configuration isn't correctly passed`);
    t.is(loadResourceStub.firstCall.args[1], 'configuration', `The type "configuration" isn't used`);
    t.is(typeof loadResourceStub.firstCall.args[2], 'undefined', `loadConfiguration should ignore the version`);
});

test('getInstalledResources should return the installed resources', (t) => {
    const resourceLoader = loadScript(t.context);

    t.context.sandbox.stub(globby, 'sync').returns(installedConnectors);
    const connectors = resourceLoader.getInstalledResources(ResourceType.connector);

    t.true(connectors.includes('installedconnector1'));
    t.true(connectors.includes('installedconnector2'));
});

test('loadResources loads all the resources of a given config', (t) => {
    const config: Configuration = {
        browserslist: [],
        connector: {
            name: '@example/webhint-connector-example',
            options: {}
        },
        extends: [],
        formatters: ['json'],
        hints: { hint1: 'error' },
        hintsTimeout: 1000,
        ignoredUrls: new Map(),
        language: '',
        parsers: []
    };
    const resourceLoader = loadScript(t.context);
    const resources = resourceLoader.loadResources(config);

    t.true(resources.missing.length > 0, `Found all resources`);
});

/**
 * More tests:
 *
 * loadResources loads all the resources of a HintConfig object with missing and incompatible
 *
 */
