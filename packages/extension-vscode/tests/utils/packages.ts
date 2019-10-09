import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import * as _packages from '../../src/utils/packages';

const stubContext = () => {
    const stubs = {
        './fs': {
            hasFile(name: string, cwd?: string) {
                return Promise.resolve(false);
            }
        } as typeof import('../../src/utils/fs'),
        './process': {
            run(command: string) {
                return Promise.resolve();
            }
        } as typeof import('../../src/utils/process')
    };

    const module = proxyquire('../../src/utils/packages', stubs) as typeof _packages;

    return { module, stubs };
};

test('It uses npm with skipped prompts to create a package.json', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();

    const runSpy = sandbox.spy(stubs['./process'], 'run');

    await module.createPackageJson('global');

    t.is(runSpy.callCount, 1);
    t.regex(runSpy.firstCall.args[0], /^npm(\.cmd)? init -y$/);

    sandbox.restore();
});

test('It installs via npm if `yarn.lock` is missing', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();

    const hasFileStub = sandbox.stub(stubs['./fs'], 'hasFile').resolves(false);
    const runSpy = sandbox.spy(stubs['./process'], 'run');

    await module.installPackages(['hint'], { cwd: 'foo' });

    t.is(hasFileStub.callCount, 1);
    t.is(hasFileStub.firstCall.args[0], 'yarn.lock');
    t.is(hasFileStub.firstCall.args[1], 'foo');
    t.is(runSpy.callCount, 1);
    t.regex(runSpy.firstCall.args[0], /^npm/);

    sandbox.restore();
});

test('It installs via yarn if `yarn.lock` is present', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();

    const hasFileStub = sandbox.stub(stubs['./fs'], 'hasFile').resolves(true);
    const runSpy = sandbox.spy(stubs['./process'], 'run');

    await module.installPackages(['hint'], { cwd: 'foo' });

    t.is(hasFileStub.callCount, 1);
    t.is(hasFileStub.firstCall.args[0], 'yarn.lock');
    t.is(hasFileStub.firstCall.args[1], 'foo');
    t.is(runSpy.callCount, 1);
    t.regex(runSpy.firstCall.args[0], /^yarn/);

    sandbox.restore();
});
