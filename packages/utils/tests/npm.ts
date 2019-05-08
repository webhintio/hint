import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { misc } from '../src';
import { readFile } from '../src/fs';

type Fs = {
    existsSync: () => boolean;
};

type HasYarnLock = () => boolean;

type CWD = () => string;

type Logger = {
    error: () => void;
    log: () => void;
};

type NPMRegistryFetch = {
    json: (url: string) => Promise<any>;
};

type LoadJSONFileModule = () => string;

type FindPackageRootModule = () => string;

type NPMContext = {
    child: Child;
    cwd: CWD;
    findPackageRootModule: FindPackageRootModule;
    fs: Fs;
    hasYarnLock: HasYarnLock;
    loadJSONFileModule: LoadJSONFileModule;
    logger: Logger;
    npmRegistryFetch: NPMRegistryFetch;
    sandbox: sinon.SinonSandbox;
};

type Child = {
    spawn: (command: string, args: string[]) => EventEmitter | null;
};

const test = anyTest as TestInterface<NPMContext>;
const devDependencyJson = JSON.parse(readFile(`${__dirname}/fixtures/dev-package.json`));
const dependencyJson = JSON.parse(readFile(`${__dirname}/fixtures/dep-package.json`));

const getEmitter = () => {
    const emitter = new EventEmitter();

    return emitter;
};

const initContext = (t: ExecutionContext<NPMContext>) => {
    t.context.findPackageRootModule = (): string => {
        return '';
    };
    t.context.fs = {
        existsSync(): boolean {
            return true;
        }
    };
    t.context.hasYarnLock = (): boolean => {
        return false;
    };
    t.context.loadJSONFileModule = (): string => {
        return '';
    };
    t.context.sandbox = sinon.createSandbox();
    t.context.logger = {
        error() { },
        log() { }
    };
    t.context.npmRegistryFetch = {
        json(url: string) {
            return Promise.resolve();
        }
    };
    t.context.child = {
        spawn(command: string, args: string[]): EventEmitter | null {
            return null;
        }
    };
    t.context.cwd = (): string => {
        return '';
    };
};

const loadScript = (context: NPMContext) => {
    return proxyquire('../src/npm', {
        './fs': {
            cwd: context.cwd,
            loadJSONFile: context.loadJSONFileModule
        },
        './has-yarnlock': context.hasYarnLock,
        './logging': context.logger,
        './packages': { findPackageRoot: context.findPackageRootModule },
        child_process: context.child, // eslint-disable-line camelcase
        fs: context.fs,
        'npm-registry-fetch': context.npmRegistryFetch
    });
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('installPackages should run the right command `hint` is installed locally, and has `hint` as a devDependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context, 'findPackageRootModule').returns('/example/path');
    sandbox.stub(t.context, 'cwd').returns('/example/path');
    sandbox.stub(t.context, 'loadJSONFileModule').returns(devDependencyJson);

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install --save-dev hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed locally, and has `hint` as a regular dependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context, 'findPackageRootModule').returns('/example/path');
    sandbox.stub(t.context, 'cwd').returns('/example/path');
    sandbox.stub(t.context, 'loadJSONFileModule').returns(dependencyJson);

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1');
});

test('installPackages should run `yarn` if yarn.lock is found, `hint` is installed locally, and has `hint` as a regular dependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    sandbox.stub(t.context, 'hasYarnLock').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context, 'findPackageRootModule').returns('/example/path');
    sandbox.stub(t.context, 'cwd').returns('/example/path');
    sandbox.stub(t.context, 'loadJSONFileModule').returns(dependencyJson);

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'yarn install hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed locally but the project package.json doesn\'t exist', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context, 'findPackageRootModule').throws(new Error(`Path doesn't exist.`));

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed locally but the project package.json is not valid', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context, 'findPackageRootModule').returns('/example/path');
    sandbox.stub(t.context, 'cwd').returns('/example/path');
    sandbox.stub(t.context, 'loadJSONFileModule').throws(new Error('Invalid JSON.'));

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.true(childSpawnStub.called);
    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed globally', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(false);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install --global hint1 @hint/formatter-formatter1');
});

test('installPackages should show the command to run if the installation fail and `hint` is installed locally', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context, 'findPackageRootModule').returns('/example/path');
    sandbox.stub(t.context, 'cwd').returns('/example/path');
    sandbox.stub(t.context, 'loadJSONFileModule').returns(devDependencyJson);
    sandbox.spy(t.context.logger, 'log');

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 1);

    await promise;

    t.true(childSpawnStub.args[0][0].includes('npm install --save-dev hint1 @hint/formatter-formatter1'));
    t.false(childSpawnStub.args[0][0].includes('npm install --global hint1 @hint/formatter-formatter1'));
});

test('installPackages should show the command to run if the installation fail and `hint` is installed globally', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'existsSync').returns(false);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.spy(t.context.logger, 'log');

    const npmUtils = loadScript(t.context);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await misc.delay(500);

    emitter.emit('exit', 1);

    await promise;

    t.true(childSpawnStub.args[0][0].includes('npm install --global hint1 @hint/formatter-formatter1'));
});

test('search should search the right query', async (t) => {
    const sandbox = t.context.sandbox;

    const NPMRegistryFetchJsonStub = sandbox.stub(t.context.npmRegistryFetch, 'json').resolves({
        objects: [],
        total: 0
    });

    const npmUtils = loadScript(t.context);

    await npmUtils.search('hint-');

    t.true(NPMRegistryFetchJsonStub.calledOnce);
    t.is(NPMRegistryFetchJsonStub.args[0][0], '/-/v1/search?text=hint-&size=100');
});

test('search should get all the results', async (t) => {
    const sandbox = t.context.sandbox;

    const NPMRegistryFetchJsonStub = sandbox.stub(t.context.npmRegistryFetch, 'json')
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


    const npmUtils = loadScript(t.context);

    await npmUtils.search('hint-');

    t.is(NPMRegistryFetchJsonStub.callCount, 3);

    const args = NPMRegistryFetchJsonStub.args;

    t.true(args[0][0].includes('text=hint-'));
    t.false(args[0][0].includes('&from='));
    t.true(args[1][0].includes('text=hint-'));
    t.true(args[1][0].includes('&from=5'));
    t.true(args[2][0].includes('text=hint-'));
    t.true(args[2][0].includes('&from=10'));
});
