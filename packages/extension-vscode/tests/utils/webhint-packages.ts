import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const stubContext = () => {
    const stubs = {
        './fs': {
            '@noCallThru': true,
            hasFile(path: string) {
                return Promise.resolve(true);
            },
            mkdir(path: string) {
                return Promise.resolve();
            }
        },
        './packages': {
            '@noCallThru': true,
            createPackageJson(path: string) {
                return Promise.resolve();
            },
            loadPackage(name: string, opts: any) {
                if (name !== 'hint' || !opts.paths || opts.paths[0] !== 'global') {
                    throw new Error('Not found');
                }

                return Promise.resolve('webhint');
            }
        } as Partial<typeof import('../../src/utils/packages')>
    };

    const module = proxyquire('../../src/utils/webhint-packages', stubs) as typeof import('../../src/utils/webhint-packages');

    return { module, stubs };
};

test('It creates a directory for the shared instance if needed', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const hasFileStub = sandbox.stub(stubs['./fs'], 'hasFile').resolves(false);
    const mkdirSpy = sandbox.spy(stubs['./fs'], 'mkdir');

    await module.updateSharedWebhint('global');

    t.is(hasFileStub.firstCall.args[0], 'global');
    t.true(mkdirSpy.calledOnce);
    t.is(mkdirSpy.firstCall.args[0], 'global');
});

test('It creates a package.json file for the shared instance if needed', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const hasFileStub = sandbox.stub(stubs['./fs'], 'hasFile').resolves(false);
    const createPackageJsonSpy = sandbox.spy(stubs['./packages'], 'createPackageJson');

    await module.updateSharedWebhint('global');

    t.is(hasFileStub.firstCall.args[0], 'global');
    t.true(createPackageJsonSpy.calledOnce);
    t.is(createPackageJsonSpy.firstCall.args[0], 'global');
});

test('It loads shared webhint when prompting to install a local copy', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const loadPackageSpy = sandbox.spy(stubs['./packages'], 'loadPackage');

    let promptCalled = false;
    let promptComplete = false;

    const hint = await module.loadWebhint('local', 'global', async () => {
        promptCalled = true;

        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });

        promptComplete = true;
    });

    t.is(hint as any, 'webhint');
    t.true(promptCalled);
    t.false(promptComplete);
    t.true(loadPackageSpy.calledTwice);
    t.deepEqual(loadPackageSpy.firstCall.args[0], 'hint');
    t.deepEqual(loadPackageSpy.firstCall.args[1], { paths: ['local'] });
    t.deepEqual(loadPackageSpy.secondCall.args[0], 'hint');
    t.deepEqual(loadPackageSpy.secondCall.args[1], { paths: ['global'] });
});
