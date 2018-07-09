import * as path from 'path';

import test from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';
import * as proxyquire from 'proxyquire';
import { Configuration } from '../../../src/lib/config';
import { ResourceType } from '../../../src/lib/enums/resourcetype';

const cacheKey = path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js');

const installedConnectors = [
    path.join(__dirname, 'fixtures', 'connector1', 'package.json'),
    path.join(__dirname, 'fixtures', 'connector2', 'package.json')
];

const fakeResource = {};
const fakeHint = { meta: {} };
const cleanCache = () => {
    delete require.cache[cacheKey];
};

test.serial('tryToLoadFrom throws an error if a dependency is missing', async (t) => {
    // import doesn't find module
    const Module = require('module');
    const resourceLoader = await import('../../../src/lib/utils/resource-loader');

    const sandbox = sinon.createSandbox();

    sandbox.stub(Module.prototype, 'require').throws({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot load module 'iltorb'`
    });

    const { message } = t.throws(() => {
        resourceLoader.tryToLoadFrom('hint');
    });

    t.is(message, 'Module iltorb not found when loading hint');

    sandbox.restore();
});

test.serial('tryToLoadFrom does nothing if the package itself is missing', async (t) => {
    // import doesn't find module
    const Module = require('module');
    const resourceLoader = await import('../../../src/lib/utils/resource-loader');

    const sandbox = sinon.createSandbox();

    sandbox.stub(Module.prototype, 'require').throws({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot load module 'hint'`
    });

    const resource = resourceLoader.tryToLoadFrom('hint');

    t.is(resource, null);

    sandbox.restore();
});

// TODO: Add tests to verify the order of loading is the right one: core -> scoped -> prefixed. This only checks core resources
test('loadResource looks for resources in the right order (core > @hint > hint- ', async (t) => {
    cleanCache();

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const resourceName = 'missing-hint';
    const resourceType: ResourceType = ResourceType.hint;

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);
    tryToLoadFromStub.returns(null);

    t.throws(() => {
        resourceLoader.loadResource(resourceName, resourceType);
    });

    t.true((tryToLoadFromStub.firstCall.args[0] as string).endsWith(`${resourceName}`), 'Tries to load scoped package second');
    t.true((tryToLoadFromStub.secondCall.args[0] as string).endsWith(`hint-${resourceName}`), 'Tries to load prefixed package third');
    t.true((tryToLoadFromStub.thirdCall.args[0] as string).endsWith(path.normalize(`/dist/src/lib/${resourceType}s/${resourceName}/${resourceName}.js`)), 'Tries to load core first');

    tryToLoadFromStub.restore();
});

test('loadHint calls loadResource with the right parameters', (t) => {
    cleanCache();

    // Using require to allow call loadHint with just 1 parameter.
    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const loadResourceStub = sinon.stub(resourceLoader, 'loadResource');

    loadResourceStub.throws({});

    t.throws(() => {
        resourceLoader.loadHint('fake-hint');
    });

    t.is(loadResourceStub.firstCall.args[0], 'fake-hint', `The name of the hint isn't correctly passed`);
    t.is(loadResourceStub.firstCall.args[1], 'hint', `The type "hint" isn't used`);
    t.is(typeof loadResourceStub.firstCall.args[2], 'undefined', `loadHint should ignore the version`);

    loadResourceStub.restore();
});

test('loadConfiguration calls loadResource with the right parameters', async (t) => {
    cleanCache();

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const loadResourceStub = sinon.stub(resourceLoader, 'loadResource');

    loadResourceStub.throws({});

    t.throws(() => {
        resourceLoader.loadConfiguration('fake-configuration');
    });

    t.is(loadResourceStub.firstCall.args[0], 'fake-configuration', `The name of the configuration isn't correctly passed`);
    t.is(loadResourceStub.firstCall.args[1], 'configuration', `The type "configuration" isn't used`);
    t.is(typeof loadResourceStub.firstCall.args[2], 'undefined', `loadConfiguration should ignore the version`);

    loadResourceStub.restore();
});

test('getInstalledResources should return the installed resources', async (t) => {
    cleanCache();

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const globbyStub = sinon.stub(globby, 'sync').returns(installedConnectors);
    const connectors = resourceLoader.getInstalledResources(ResourceType.connector);

    t.true(connectors.includes('installedconnector1'));
    t.true(connectors.includes('installedconnector2'));

    globbyStub.restore();
});

test.serial('loadResource ignores the version by default and returns the resource provided by tryToLoadFrom', async (t) => {
    cleanCache();

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const resource = resourceLoader.loadResource('fake-resource', ResourceType.parser);
    const resource2 = resourceLoader.loadResource('fake-resource', ResourceType.parser);

    t.is(resource, fakeResource);
    t.is(resource2, fakeResource);
    t.true(tryToLoadFromStub.calledOnce, 'tryToLoadFrom was called multiple times');

    tryToLoadFromStub.restore();
});

test('loadResource throws an error if the resource is not found', async (t) => {
    cleanCache();

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.formatter);
    });

    t.is(message, 'Resource another-fake-resource not found', 'Received a different exception');
});

test.serial('loadResource throws an error if the version is incompatible when using "verifyVersion"', async (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/packages/load-hint-package': {
            default() {
                return { version: '1.1.0' };
            }
        },
        '../utils/packages/load-package': {
            default() {
                return { peerDependencies: { hint: '0.1.0' } };
            }
        }
    });

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.formatter, [], true);
    });

    t.is(message, `Resource another-fake-resource isn't compatible with current hint version`, 'Received a different exception');
});

test.serial('loadResource returns the resource if versions are compatible', async (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/packages/load-hint-package': {
            default() {
                return { version: '0.1.0' };
            }
        },
        '../utils/packages/load-package': {
            default() {
                return { peerDependencies: { hint: '0.1.0' } };
            }
        }
    });

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const resource = resourceLoader.loadResource('another-fake-resource', ResourceType.formatter, [], true);

    t.is(resource, fakeResource, `Resources aren't the same`);
});

test.serial('loadResource throws an error if the hint is loaded from the current working directory but the hint name doesn\'t match', async (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/packages/load-package': {
            default() {
                return { name: 'fake-resource' };
            }
        }
    });

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const processStub = sinon.stub(process, 'cwd');

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);
    tryToLoadFromStub.returns(fakeResource);
    processStub.returns('fakePath');

    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.hint);
    });

    t.is(message, 'Resource another-fake-resource not found', 'Received a different exception');

    tryToLoadFromStub.restore();
    processStub.restore();
});

test.serial(`loadResource doesn't throw an error if the hint is loaded from the current working directory but the hint name matches`, async (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/packages/load-package': {
            default() {
                return { name: 'hint-another-fake-resource' };
            }
        }
    });

    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const processStub = sinon.stub(process, 'cwd');

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);
    tryToLoadFromStub.returns(fakeHint);
    processStub.returns('fakePath');

    t.notThrows(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.hint);
    });

    tryToLoadFromStub.restore();
    processStub.restore();
});

test('loadResources loads all the resources of a given config', async (t) => {
    cleanCache();

    const config: Configuration = {
        browserslist: [],
        connector: {
            name: 'jsdom',
            options: {}
        },
        extends: [],
        formatters: ['json'],
        hints: { hint1: 'error' },
        hintsTimeout: 1000,
        ignoredUrls: [],
        parsers: []
    };
    const resourceLoader = await import('../../../src/lib/utils/resource-loader');
    const resources = resourceLoader.loadResources(config);

    t.true(resources.missing.length > 0, `Found all resources`);
});
/**
 * More tests:
 *
 * loadResources loads all the resources of a HintConfig object with missing and incompatible
 *
 */
