import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import delay from '../../../src/lib/utils/misc/delay';
import readFile from '../../../src/lib/utils/fs/read-file';

const npmRegistryFetch = { json() { } };

const child = { spawn() { } };
const logger = {
    error() { },
    log() { }
};

const findPackageRootModule = { default() { } };
const loadJSONFileModule = { default() { } };

const fs = { existsSync() { } };

const devDependencyJson = JSON.parse(readFile(`${__dirname}/fixtures/dev-package.json`));
const dependencyJson = JSON.parse(readFile(`${__dirname}/fixtures/dep-package.json`));

const getEmitter = () => {
    const emitter = new EventEmitter();

    return emitter;
};

proxyquire('../../../src/lib/utils/npm', {
    './fs/load-json-file': loadJSONFileModule,
    './logging': logger,
    './packages/find-package-root': findPackageRootModule,
    child_process: child, // eslint-disable-line camelcase
    fs,
    'npm-registry-fetch': npmRegistryFetch
});

test.beforeEach((t) => {
    t.context.npmRegistryFetch = npmRegistryFetch;
});

test.serial('installPackages should run the right command `hint` is installed locally, and has `hint` as a devDependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(loadJSONFileModule, 'default').returns(devDependencyJson);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install hint1 @hint/formatter-formatter1 --save-dev');

    sandbox.restore();
});

test.serial('installPackages should run the right command if `hint` is installed locally, and has `hint` as a regular dependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(loadJSONFileModule, 'default').returns(dependencyJson);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install hint1 @hint/formatter-formatter1');

    sandbox.restore();
});

test.serial('installPackages should run the right command if `hint` is installed locally but the project package.json doesn\'t exist', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(findPackageRootModule, 'default').throws(new Error(`Path doesn't exist.`));

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install hint1 @hint/formatter-formatter1');

    sandbox.restore();
});

test.serial('installPackages should run the right command if `hint` is installed locally but the project package.json is not valid', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(loadJSONFileModule, 'default').throws(new Error('Invalid JSON.'));

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;
    t.true(t.context.child.spawn.called);
    t.is(t.context.child.spawn.args[0][0], 'npm install hint1 @hint/formatter-formatter1');

    sandbox.restore();
});

test.serial('installPackages should run the right command if `hint` is installed globally', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(false);
    sandbox.stub(child, 'spawn').returns(emitter);

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.context.child = child;

    t.is(t.context.child.spawn.args[0][0], 'npm install hint1 @hint/formatter-formatter1 -g');

    sandbox.restore();
});

test.serial('installPackages should show the command to run if the installation fail and `hint` is installed locally', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.stub(findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(process, 'cwd').returns('/example/path');
    sandbox.stub(loadJSONFileModule, 'default').returns(devDependencyJson);
    sandbox.spy(logger, 'log');

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 1);

    await promise;

    t.context.child = child;

    t.true(t.context.child.spawn.args[0][0].includes('npm install hint1 @hint/formatter-formatter1 --save-dev'));
    t.false(t.context.child.spawn.args[0][0].includes('npm install hint1 @hint/formatter-formatter1 -g'));

    sandbox.restore();
});

test.serial('installPackages should show the command to run if the installation fail and `hint` is installed globally', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = await import('../../../src/lib/utils/npm');

    sandbox.stub(fs, 'existsSync').returns(false);
    sandbox.stub(child, 'spawn').returns(emitter);
    sandbox.spy(logger, 'log');

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 1);

    await promise;

    t.context.child = child;

    t.true(t.context.child.spawn.args[0][0].includes('npm install hint1 @hint/formatter-formatter1 -g'));

    sandbox.restore();
});

test.serial('search should search the right query', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(npmRegistryFetch, 'json').resolves({
        objects: [],
        total: 0
    });

    const npmUtils = await import('../../../src/lib/utils/npm');

    await npmUtils.search('hint-');

    t.true(t.context.npmRegistryFetch.json.calledOnce);
    t.is(t.context.npmRegistryFetch.json.args[0][0], '/-/v1/search?text=hint-&size=100');

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


    const npmUtils = await import('../../../src/lib/utils/npm');

    await npmUtils.search('hint-');

    t.is(t.context.npmRegistryFetch.json.callCount, 3);

    const args = t.context.npmRegistryFetch.json.args;

    t.true(args[0][0].includes('text=hint-'));
    t.false(args[0][0].includes('&from='));
    t.true(args[1][0].includes('text=hint-'));
    t.true(args[1][0].includes('&from=5'));
    t.true(args[2][0].includes('text=hint-'));
    t.true(args[2][0].includes('&from=10'));

    sandbox.restore();
});
