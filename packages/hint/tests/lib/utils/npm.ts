import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import delay from '../../../src/lib/utils/misc/delay';
import readFile from '../../../src/lib/utils/fs/read-file';

type Fs = {
    existsSync: () => boolean;
}

type CWD = {
    default: () => string;
};

type Logger = {
    error: () => void;
    log: () => void;
};

type NPMRegistryFetch = {
    json: (url: string) => Promise<any>;
};

type LoadJSONFileModule = {
    default: () => string;
};

type FindPackageRootModule = {
    default: () => string;
}

type NPMContext = {
    child: Child;
    cwd: CWD;
    findPackageRootModule: FindPackageRootModule;
    fs: Fs;
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
    t.context.findPackageRootModule = {
        default(): string {
            return '';
        }
    };
    t.context.fs = {
        existsSync(): boolean {
            return true;
        }
    };
    t.context.loadJSONFileModule = {
        default(): string {
            return '';
        }
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
    t.context.cwd = {
        default(): string {
            return '';
        }
    };
};

const loadScript = (context: NPMContext) => proxyquire('../../../src/lib/utils/npm', {
    './fs/cwd': context.cwd,
    './fs/load-json-file': context.loadJSONFileModule,
    './logging': context.logger,
    './packages/find-package-root': context.findPackageRootModule,
    child_process: context.child, // eslint-disable-line camelcase
    fs: context.fs,
    'npm-registry-fetch': context.npmRegistryFetch
});

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('installPackages should run the right command `hint` is installed locally, and has `hint` as a devDependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context.findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(t.context.cwd, 'default').returns('/example/path');
    sandbox.stub(t.context.loadJSONFileModule, 'default').returns(devDependencyJson);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1 --save-dev');
});

test('installPackages should run the right command if `hint` is installed locally, and has `hint` as a regular dependency', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context.findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(t.context.cwd, 'default').returns('/example/path');
    sandbox.stub(t.context.loadJSONFileModule, 'default').returns(dependencyJson);
    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed locally but the project package.json doesn\'t exist', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context.findPackageRootModule, 'default').throws(new Error(`Path doesn't exist.`));

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed locally but the project package.json is not valid', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context.findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(t.context.cwd, 'default').returns('/example/path');
    sandbox.stub(t.context.loadJSONFileModule, 'default').throws(new Error('Invalid JSON.'));

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.true(childSpawnStub.called);
    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1');
});

test('installPackages should run the right command if `hint` is installed globally', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(false);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 0);

    await promise;

    t.is(childSpawnStub.args[0][0], 'npm install hint1 @hint/formatter-formatter1 -g');
});

test('installPackages should show the command to run if the installation fail and `hint` is installed locally', async (t) => {
    const emitter = getEmitter();
    const sandbox = sinon.createSandbox();
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(true);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.stub(t.context.findPackageRootModule, 'default').returns('/example/path');
    sandbox.stub(t.context.cwd, 'default').returns('/example/path');
    sandbox.stub(t.context.loadJSONFileModule, 'default').returns(devDependencyJson);
    sandbox.spy(t.context.logger, 'log');

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 1);

    await promise;

    t.true(childSpawnStub.args[0][0].includes('npm install hint1 @hint/formatter-formatter1 --save-dev'));
    t.false(childSpawnStub.args[0][0].includes('npm install hint1 @hint/formatter-formatter1 -g'));
});

test('installPackages should show the command to run if the installation fail and `hint` is installed globally', async (t) => {
    const emitter = getEmitter();
    const sandbox = t.context.sandbox;
    const npmUtils = loadScript(t.context);

    sandbox.stub(t.context.fs, 'existsSync').returns(false);
    const childSpawnStub = sandbox.stub(t.context.child, 'spawn').returns(emitter);

    sandbox.spy(t.context.logger, 'log');

    const promise = npmUtils.installPackages(['hint1', '@hint/formatter-formatter1']);

    await delay(500);

    emitter.emit('exit', 1);

    await promise;

    t.true(childSpawnStub.args[0][0].includes('npm install hint1 @hint/formatter-formatter1 -g'));
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
