import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const stubContext = () => {
    const stubs = {
        './fs': {
            '@noCallThru': true,
            hasFile() {
                return Promise.resolve(true);
            }
        },
        './packages': {
            '@noCallThru': true,
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
