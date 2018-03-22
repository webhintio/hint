import * as path from 'path';
import * as stream from 'stream';

import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { delay, readFile } from '../../../src/lib/utils/misc';

const npm = {
    load(sync, cb) {
        cb();
    }
};

const child = { spawn() { } };
const logger = {
    error() { },
    log() { }
};
const misc = {
    findPackageRoot() { },
    loadJSONFile() { }
};

const esearchContainer = { esearch() { } };
const devDependencyJson = JSON.parse(readFile(`${__dirname}/fixtures/dev-package.json`));
const dependencyJson = JSON.parse(readFile(`${__dirname}/fixtures/dep-package.json`));

const getEmitter = () => {
    const emitter = new EventEmitter();

    (emitter as any).stderr = new EventEmitter();

    (((emitter as any).stderr) as any).setEncoding = () => { };

    return emitter;
};

proxyquire('../../../src/lib/utils/npm', {
    './logging': logger,
    './misc': misc,
    child_process: child, // eslint-disable-line camelcase
    npm,
    'npm/lib/search/esearch': esearchContainer.esearch
});

test.serial('installPackages should run the right command if package.json exists in the current work directory, and has `sonarwhal` as a devDependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(misc, 'findPackageRoot').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(misc, 'loadJSONFile').returns(devDependencyJson);
    const promise = npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 --save-dev');

    sandbox.restore();
});

test.serial('installPackages should run the right command if package.json exists in the current working directory, and has `sonarwhal` as a regular dependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(misc, 'findPackageRoot').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(misc, 'loadJSONFile').returns(dependencyJson);
    const promise = npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1');

    sandbox.restore();
});

test.serial(`installPackages should run the right command if path to package.json doesn't exist`, async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(misc, 'findPackageRoot').throws(new Error(`Path doesn't exist.`));

    const promise = npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 -g');

    sandbox.restore();
});

test.serial(`installPackages should run the right command if package.json exists but is not valid`, async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(misc, 'findPackageRoot').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(misc, 'loadJSONFile').throws(new Error('Invalid JSON.'));

    const promise = npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;
    t.false(t.context.child.spawn.called);

    sandbox.restore();
});

test.serial('installPackages should show the command to run if the installation fail and package.json exists', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(misc, 'findPackageRoot').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(misc, 'loadJSONFile').returns(devDependencyJson);
    sandbox.spy(logger, 'log');

    const promise = npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    await delay(500);

    (emitter as any).stderr.emit('data', 'Error installing packages');
    emitter.emit('exit', 1);

    await promise;

    t.context.child = child;

    t.true(t.context.child.spawn.args[0][0].includes('npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 --save-dev'));
    t.false(t.context.child.spawn.args[0][0].includes('npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 -g'));

    sandbox.restore();
});

test.serial(`installPackages should show the command to run if the installation fail and package.json doesn't exist`, async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(misc, 'findPackageRoot').throws(new Error(`Path doesn't exist.`));
    sandbox.spy(logger, 'log');

    const promise = npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    await delay(500);

    (emitter as any).stderr.emit('data', 'Error installing packages');
    emitter.emit('exit', 1);

    await promise;

    t.context.child = child;

    t.true(t.context.child.spawn.args[0][0].includes('npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 -g'));

    sandbox.restore();
});

test.serial('search should search for the right data', async (t) => {
    const sandbox = sinon.createSandbox();
    const mockedStream = new stream.Writable();

    sandbox.stub(esearchContainer, 'esearch').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/npm.js')];

    proxyquire('../../../src/lib/utils/npm', {
        './logging': logger,
        './misc': misc,
        child_process: child, // eslint-disable-line camelcase
        npm,
        'npm/lib/search/esearch': esearchContainer.esearch
    });

    const npmUtils = require('../../../src/lib/utils/npm');

    t.context.esearchContainer = esearchContainer;

    const promise = npmUtils.search('sonarwhal-rule');

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.esearchContainer.esearch.args[0][0];

    t.is(options.include[0], 'sonarwhal-rule');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('search should fail if something goes wrong', async (t) => {
    const sandbox = sinon.createSandbox();
    const mockedStream = new stream.Writable();

    sandbox.stub(esearchContainer, 'esearch').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/npm.js')];

    proxyquire('../../../src/lib/utils/npm', {
        './logging': logger,
        './misc': misc,
        child_process: child, // eslint-disable-line camelcase
        npm,
        'npm/lib/search/esearch': esearchContainer.esearch
    });

    const npmUtils = require('../../../src/lib/utils/npm');

    t.context.esearchContainer = esearchContainer;

    const promise = npmUtils.search('sonarwhal-rule');

    await delay(500);
    mockedStream.emit('error', new Error('Error searching'));

    t.plan(1);
    try {
        await promise;
    } catch (err) {
        t.is(err.message, 'Error searching');
    }

    sandbox.restore();
});
