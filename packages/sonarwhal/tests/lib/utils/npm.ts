import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { delay, readFile } from '../../../src/lib/utils/misc';

const npmRegistryFetch = { json() { } };

const child = { spawn() { } };
const logger = {
    error() { },
    log() { }
};
const misc = {
    findPackageRoot() { },
    loadJSONFile() { }
};
const spinner = {
    fail() { },
    start() { },
    succeed() { },
    text: ''
};

const ora = () => {
    return spinner;
};

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
    'npm-registry-fetch': npmRegistryFetch,
    ora
});

test.beforeEach((t) => {
    t.context.npmRegistryFetch = npmRegistryFetch;
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

test.serial('search should search the right query', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(npmRegistryFetch, 'json').resolves({
        objects: [],
        total: 0
    });

    const npmUtils = require('../../../src/lib/utils/npm');

    await npmUtils.search('sonarwhal-rule');

    t.true(t.context.npmRegistryFetch.json.calledOnce);
    t.is(t.context.npmRegistryFetch.json.args[0][0], '/-/v1/search?text=sonarwhal-rule&size=100');

    sandbox.restore();
});

test.serial('search should get all the results', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(npmRegistryFetch, 'json')
        .onFirstCall()
        .resolves({
            objects: [{}, {}, {}, {}, {}],
            total: 13
        })
        .onSecondCall()
        .resolves({
            objects: [{}, {}, {}, {}, {}],
            total: 13
        })
        .onThirdCall()
        .resolves({
            objects: [{}, {}, {}],
            total: 13
        });


    const npmUtils = require('../../../src/lib/utils/npm');

    await npmUtils.search('sonarwhal-rule');

    t.is(t.context.npmRegistryFetch.json.callCount, 3);

    const args = t.context.npmRegistryFetch.json.args;

    t.true(args[0][0].includes('text=sonarwhal-rule'));
    t.false(args[0][0].includes('&from='));
    t.true(args[1][0].includes('text=sonarwhal-rule'));
    t.true(args[1][0].includes('&from=5'));
    t.true(args[2][0].includes('text=sonarwhal-rule'));
    t.true(args[2][0].includes('&from=10'));

    sandbox.restore();
});
