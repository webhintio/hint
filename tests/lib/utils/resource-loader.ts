import * as path from 'path';

import test from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';

import * as resourceLoader from '../../../src/lib/utils/resource-loader';

const fakeGlobby = { sync() { } };

test.beforeEach((t) => {
    t.context.fakeGlobby = fakeGlobby;
    sinon.stub(fakeGlobby, 'sync').returns([path.join(process.cwd(), 'dist/src/lib/connectors/cdp/cdp.js'), path.join(process.cwd(), 'dist/src/lib/connectors/jsdom/jsdom.js')]);
});

test.afterEach.always((t) => {
    t.context.fakeGlobby.sync.restore();
});

// TODO: Add tests to verify the order of loading is the right one: core -> scoped -> prefixed. This only checks core resources
test('loadResource looks for resources in the right order (core > @sonarwhal > sonarwhal- ', (t) => {
    const tryToLoadFromStub = sinon.stub(resourceLoader, 'tryToLoadFrom');
    const resourceName = 'missing-rule';
    const resourceType = 'rule';

    tryToLoadFromStub.onFirstCall().returns(null);
    tryToLoadFromStub.onSecondCall().returns(null);
    tryToLoadFromStub.onThirdCall().returns(null);

    t.throws(() => {
        resourceLoader.loadResource(resourceName, resourceType);
    });
    t.true(tryToLoadFromStub.calledThrice, 'tryToLoadFromStub is called thrice');
    t.true((tryToLoadFromStub.firstCall.args[0] as string).endsWith(`/dist/src/lib/${resourceType}s/${resourceName}/${resourceName}.js`), 'Tries to load core first');
    t.true((tryToLoadFromStub.secondCall.args[0] as string).endsWith(`@sonarwhal/${resourceName}`), 'Tries to load scoped package second');
    t.true((tryToLoadFromStub.thirdCall.args[0] as string).endsWith(`sonarwhal-${resourceName}`), 'Tries to load prefixed package third');

    tryToLoadFromStub.restore();
});

const getResourceFiles = (type) => {
    const currentResources = globby.sync(`{./,./node_modules/sonar-*}dist/src/lib/${type}s/**/*.js`);

    return currentResources.reduce((resources, resourceFile) => {
        const resourceName = path.basename(resourceFile, '.js');

        if (path.dirname(resourceFile).includes(resourceName)) {
            resources.push(resourceName);
        }

        return resources;
    }, []);
};

['connector', 'formatter', 'rule'].forEach((e) => {
    const functionName = `getCore${e.charAt(0).toUpperCase()}${e.slice(1)}s`;

    test(`'${functionName}' should return all ${e}s`, (t) => {
        const entities = resourceLoader[functionName]();
        const files = getResourceFiles(e);

        t.is(entities.length, files.length);
    });
});
