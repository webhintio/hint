import * as path from 'path';
import * as stream from 'stream';

import test from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';
import * as proxyquire from 'proxyquire';

import { delay } from '../../../src/lib/utils/misc';

const npm = { search() { } };

// TODO: Add tests to verify the order of loading is the right one: core -> scoped -> prefixed. This only checks core resources
test('loadResource looks for resources in the right order (core > @sonarwhal > sonarwhal- ', (t) => {
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

const getResourceFiles = (type) => {
    const currentResources = globby.sync(`{,packages/sonarwhal/,node_modules/sonarwhal-*/}dist/src/lib/${type}s/**/*.js`);

    return currentResources.reduce((resources, resourceFile) => {
        const resourceName = path.basename(resourceFile, '.js');

        if (path.dirname(resourceFile).includes(resourceName)) {
            resources.push(resourceName);
        }

        return resources;
    }, []);
};

['connector', 'formatter', 'rule', 'parser'].forEach((e) => {
    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const functionName = `getCore${e.charAt(0).toUpperCase()}${e.slice(1)}s`;

    test(`'${functionName}' should return all ${e}s`, (t) => {
        const entities = resourceLoader[functionName]();
        const files = getResourceFiles(e);

        t.is(entities.length, files.length);
    });
});

const installedConnectors = [
    path.join(__dirname, 'fixtures', 'connector1', 'package.json'),
    path.join(__dirname, 'fixtures', 'connector2', 'package.json')
];

test('getInstalledConnectors should returns the installed connectors', (t) => {
    const resourceLoader = require('../../../src/lib/utils/resource-loader');
    const globbyStub = sinon.stub(globby, 'sync').returns(installedConnectors);

    const connectors = resourceLoader.getInstalledConnectors();

    t.true(connectors.includes('installedConnector1'));
    t.true(connectors.includes('installedConnector2'));

    globbyStub.restore();
});

test.serial('getExternalRulesFromNpm should search for the word "sonarwhal-rule"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);
    t.context.npm = npm;

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    const promise = resourceLoader.getExternalRulesFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], 'sonarwhal-rule');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getCoreRulesFromNpm should search for the word "@sonarwhal/rule"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getCoreRulesFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], '@sonarwhal/rule');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getExternalConnectorsFromNpm should search for the word "sonarwhal-connector"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getExternalConnectorsFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], 'sonarwhal-connector');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getCoreConnectorsFromNpm should search for the word "@sonarwhal/connector"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getCoreConnectorsFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], '@sonarwhal/connector');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getExternalParsersFromNpm should search for the word "sonarwhal-parser"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getExternalParsersFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], 'sonarwhal-parser');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getCoreParsersFromNpm should search for the word "@sonarwhal/parser"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getCoreParsersFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], '@sonarwhal/parser');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getExternalFormattersFromNpm should search for the word "sonarwhal-formatter"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sandbox.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getExternalFormattersFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], 'sonarwhal-formatter');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('getCoreFormattersFromNpm should search for the word "@sonarwhal/formatter"', async (t) => {
    const mockedStream = new stream.Writable();
    const sandbox = sinon.createSandbox();

    sinon.stub(npm, 'search').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/resource-loader.js')];

    proxyquire('../../../src/lib/utils/resource-loader', {
        '../utils/npm': npm,
        globby
    });

    const resourceLoader = require('../../../src/lib/utils/resource-loader');

    t.context.npm = npm;

    const promise = resourceLoader.getCoreFormattersFromNpm();

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.npm.search.args[0][0];

    t.is(options.include[0], '@sonarwhal/formatter');
    t.is(options.include.length, 1);

    sandbox.restore();
});
