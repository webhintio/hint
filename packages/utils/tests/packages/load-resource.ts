import anyTest, { TestInterface } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { ResourceType } from '../../src/types/resource-type';

const fakeResource = {};
const fakeHint = { meta: {} };

type LoadResourceContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<LoadResourceContext>;

const loadScript = (options?: any) => {
    if (!options) {
        return require('../../src/packages/load-resource');
    }

    return proxyquire('../../src/packages/load-resource', options);
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test.serial('loadResource ignores the version by default and returns the resource provided by tryToLoadFrom', (t) => {
    const resourceLoader = loadScript();
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const resource = resourceLoader.loadResource('fake-resource', ResourceType.parser);
    const resource2 = resourceLoader.loadResource('fake-resource', ResourceType.parser);

    t.is(resource, fakeResource);
    t.is(resource2, fakeResource);
    t.true(tryToLoadFromStub.calledOnce, 'tryToLoadFrom was called multiple times');
});

test.serial('loadResource throws an error if the resource is not found', (t) => {
    const resourceLoader = loadScript();
    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.formatter);
    });

    t.is(message, 'Resource another-fake-resource not found', 'Received a different exception');
});

test.serial('tryToLoadFrom throws an error if a dependency is missing', (t) => {
    // import doesn't find module
    const Module = require('module');
    const resourceLoader = loadScript();

    t.context.sandbox.stub(Module.prototype, 'require').throws({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot load module 'iltorb'`
    });

    const { message } = t.throws(() => {
        resourceLoader.tryToLoadFrom('hint');
    });

    t.is(message, 'Module iltorb not found when loading hint');
});

test.serial('tryToLoadFrom does nothing if the package itself is missing', (t) => {
    // import doesn't find module
    const Module = require('module');
    const resourceLoader = loadScript();

    t.context.sandbox.stub(Module.prototype, 'require').throws({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot load module 'hint'`
    });

    const resource = resourceLoader.tryToLoadFrom('hint');

    t.is(resource, null);
});

test.serial('loadResource looks for resources in the right order (@hint > webhint- > core)', (t) => {
    const resourceLoader = loadScript();
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');
    const resourceName = 'missing-hint';
    const resourceType = ResourceType.hint;

    tryToLoadFromStub.returns(null);

    t.throws(() => {
        resourceLoader.loadResource(resourceName, resourceType);
    });

    t.is(tryToLoadFromStub.firstCall.args[0], `@hint/${resourceType}-${resourceName}`, 'Tries to load scoped package second');
    t.is(tryToLoadFromStub.secondCall.args[0], `webhint-${resourceType}-${resourceName}`, 'Tries to load prefixed package third');
});

test.serial('loadResource looks for resources with full package names by their full name only', (t) => {
    const resourceLoader = loadScript();
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');
    const resourceName = '@example/webhint-hint-missing';
    const resourceType = ResourceType.hint;

    tryToLoadFromStub.returns(null);

    t.throws(() => {
        resourceLoader.loadResource(resourceName, resourceType);
    });

    t.true(tryToLoadFromStub.calledOnce);
    t.is(tryToLoadFromStub.firstCall.args[0], resourceName);
});

test.serial('loadResource looks for first-party resources with full package names by their full name only', (t) => {
    const resourceLoader = loadScript();
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');
    const resourceName = '@hint/hint-missing';
    const resourceType = ResourceType.hint;

    tryToLoadFromStub.returns(null);

    t.throws(() => {
        resourceLoader.loadResource(resourceName, resourceType);
    });

    t.true(tryToLoadFromStub.calledOnce);
    t.is(tryToLoadFromStub.firstCall.args[0], resourceName);
});

test.serial('loadResource throws an error if the version is incompatible when using "verifyVersion"', (t) => {
    const resourceLoader = loadScript({
        './load-hint-package': {
            loadHintPackage() {
                return { version: '1.1.0' };
            }
        },
        './load-package': {
            loadPackage() {
                return { peerDependencies: { hint: '0.1.0' } };
            }
        }
    });
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.formatter, [], true);
    });

    t.is(message, `Resource another-fake-resource isn't compatible with current hint version`, 'Received a different exception');
});

test.serial('loadResource returns the resource if versions are compatible', (t) => {
    const resourceLoader = loadScript({
        './load-hint-package': {
            loadHintPackage() {
                return { version: '0.1.0' };
            }
        },
        './load-package': {
            loadPackage() {
                return { peerDependencies: { hint: '0.1.0' } };
            }
        }
    });
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');

    tryToLoadFromStub.returns(fakeResource);

    const resource = resourceLoader.loadResource('another-fake-resource', ResourceType.formatter, [], true);

    t.is(resource, fakeResource, `Resources aren't the same`);
});

test.serial('loadResource throws an error if the hint is loaded from the current working directory but the hint name doesn\'t match', (t) => {
    const resourceLoader = loadScript({
        './load-package': {
            loadPackage() {
                return { name: 'fake-resource' };
            }
        }
    });
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');
    const processStub = t.context.sandbox.stub(process, 'cwd');

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.returns(fakeResource);
    processStub.returns('fakePath');

    const { message } = t.throws(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.hint);
    });

    t.is(message, 'Resource another-fake-resource not found', 'Received a different exception');

});

test.serial(`loadResource doesn't throw an error if the hint is loaded from the current working directory but the hint name matches`, (t) => {
    const resourceLoader = loadScript({
        './load-package': {
            loadPackage() {
                return { name: 'hint-another-fake-resource' };
            }
        }
    });
    const tryToLoadFromStub = t.context.sandbox.stub(resourceLoader, 'tryToLoadFrom');
    const processStub = t.context.sandbox.stub(process, 'cwd');

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.returns(fakeHint);
    processStub.returns('fakePath');

    t.notThrows(() => {
        resourceLoader.loadResource('another-fake-resource', ResourceType.hint);
    });
});
