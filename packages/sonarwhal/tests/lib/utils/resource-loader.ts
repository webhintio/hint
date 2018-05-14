import * as path from 'path';

import test from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';
import * as proxyquire from 'proxyquire';
import { SonarwhalConfig } from '../../../src/lib/config';

const cacheKey = path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js');

const installedConnectors = [
    path.join(__dirname, 'fixtures', 'connector1', 'package.json'),
    path.join(__dirname, 'fixtures', 'connector2', 'package.json')
];

const fakeResource = {};
const fakeRule = { meta: {} };
const cleanCache = () => {
    delete require.cache[cacheKey];
};

test.serial('tryToLoadFrom throws an error if a dependency is missing', (t) => {
    const Module = require('module');
    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    const sandbox = sinon.createSandbox();

    sandbox.stub(Module.prototype, 'require').throws({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot load module 'iltorb'`
    });

    const { message } = t.throws(() => {
        resourceLoader.tryToLoadFrom('sonarwhal');
    });

    t.is(message, 'Module iltorb not found when loading sonarwhal');

    sandbox.restore();
});

test.serial('tryToLoadFrom does nothing if the package itself is missing', (t) => {
    const Module = require('module');
    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    const sandbox = sinon.createSandbox();

    sandbox.stub(Module.prototype, 'require').throws({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot load module 'sonarwhal'`
    });

    const resource = resourceLoader.tryToLoadFrom('sonarwhal');

    t.is(resource, null);

    sandbox.restore();
});

// TODO: Add tests to verify the order of loading is the right one: core -> scoped -> prefixed. This only checks core resources
test('loadResource looks for resources in the right order (core > @sonarwhal > sonarwhal- ', (t) => {
    cleanCache();

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const resourceName = 'missing-rule';
    const resourceType = 'rule';

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);
    tryToLoadFromStub.returns(null);

    t.throws(() => {
        resourceLoader.loadResource(resourceName, resourceType);
    });

    t.true((tryToLoadFromStub.firstCall.args[0] as string).endsWith(`@sonarwhal/rule-${resourceName}`), 'Tries to load scoped package second');
    t.true((tryToLoadFromStub.secondCall.args[0] as string).endsWith(`sonarwhal-rule-${resourceName}`), 'Tries to load prefixed package third');
    t.true((tryToLoadFromStub.thirdCall.args[0] as string).endsWith(path.normalize(`/dist/src/lib/${resourceType}s/${resourceName}/${resourceName}.js`)), 'Tries to load core first');

    tryToLoadFromStub.restore();
});

test('loadRule calls loadResource with the right parameters', (t) => {
    cleanCache();

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const loadResourceStub = sinon.stub(resourceLoader, 'loadResource');

    loadResourceStub.throws({});

    t.throws(() => {
        resourceLoader.loadRule('fake-rule');
    });

    t.is(loadResourceStub.firstCall.args[0], 'fake-rule', `The name of the rule isn't correctly passed`);
    t.is(loadResourceStub.firstCall.args[1], 'rule', `The type "rule" isn't used`);
    t.is(typeof loadResourceStub.firstCall.args[2], 'undefined', `loadRule should ignore the version`);

    loadResourceStub.restore();
});

test('loadConfiguration calls loadResource with the right parameters', (t) => {
    cleanCache();

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
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

test('getInstalledResources should return the installed resources', (t) => {
    cleanCache();

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const globbyStub = sinon.stub(globby, 'sync').returns(installedConnectors);
    const connectors = resourceLoader.getInstalledResources('connector');

    t.true(connectors.includes('installedconnector1'));
    t.true(connectors.includes('installedconnector2'));

    globbyStub.restore();
});

test('loadResource ignores the version by default and returns the resource provided by tryToLoadFrom', (t) => {
    cleanCache();

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const resource = resourceLoader.loadResource('fake-resource', 'parser');
    const resource2 = resourceLoader.loadResource('fake-resource', 'parser');

    t.is(resource, fakeResource);
    t.is(resource2, fakeResource);
    t.true(tryToLoadFromStub.calledOnce, 'tryToLoadFrom was called multiple times');

    tryToLoadFromStub.restore();
});

test('loadResource throws an error if the resources is not found', (t) => {
    cleanCache();

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', 'formatter');
    });

    t.is(message, 'Resource another-fake-resource not found', 'Received a different exception');
});

test('loadResource throws an error if the version is incompatible when using "verifyVersion"', (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/misc': {
            getPackage() {
                return { peerDependencies: { sonarwhal: '0.1.0' } };
            },
            getSonarwhalPackage() {
                return { version: '1.1.0' };
            }
        }
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', 'formatter', [], true);
    });

    t.is(message, `Resource another-fake-resource isn't compatible with current sonarwhal version`, 'Received a different exception');
});

test('loadResource returns the resource if versions are compatible', (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/misc': {
            getPackage() {
                return { peerDependencies: { sonarwhal: '0.1.0' } };
            },
            getSonarwhalPackage() {
                return { version: '0.1.0' };
            }
        }
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const resource = resourceLoader.loadResource('another-fake-resource', 'formatter', [], true);

    t.is(resource, fakeResource, `Resources aren't the same`);
});

test('loadResource throws an error if the rule is loaded from the current working directory but the rule name doesn\'t match', (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/misc': {
            getPackage() {
                return { name: 'fake-resource' };
            }
        }
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const processStub = sinon.stub(process, 'cwd');

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);
    tryToLoadFromStub.returns(fakeResource);
    processStub.returns('fakePath');

    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', 'rule');
    });

    t.is(message, 'Resource another-fake-resource not found', 'Received a different exception');

    tryToLoadFromStub.restore();
    processStub.restore();
});

test('loadResource doesn\'t throw an error if the rule is loaded from the current working directory but the rule name matches', (t) => {
    cleanCache();

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/misc': {
            getPackage() {
                return { name: 'rule-another-fake-resource' };
            }
        }
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const processStub = sinon.stub(process, 'cwd');

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);
    tryToLoadFromStub.returns(fakeRule);
    processStub.returns('fakePath');

    t.notThrows(() => {
        resourceLoader.loadResource('another-fake-resource', 'rule');
    });

    tryToLoadFromStub.restore();
    processStub.restore();
});

test('loadResources loads all the resources of a given config', (t) => {
    cleanCache();

    const config: SonarwhalConfig = {
        browserslist: [],
        connector: {
            name: 'jsdom',
            options: {}
        },
        extends: [],
        formatters: ['json'],
        ignoredUrls: [],
        parsers: [],
        rules: { rule1: 'error' },
        rulesTimeout: 1000
    };
    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const resources = resourceLoader.loadResources(config);

    t.true(resources.missing.length > 0, `Found all resources`);
});
/**
 * More tests:
 *
 * loadResources loads all the resources of a SonarwhalConfig object with missing and incompatible
 *
 */
