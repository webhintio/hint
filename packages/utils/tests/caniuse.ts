import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

test('isSupported should call to caniuse-api.isSupported', (t) => {
    const sandbox = sinon.createSandbox();
    const caniuseApi = { isSupported() { } };

    const issupportedSpy = sandbox.spy(caniuseApi, 'isSupported');

    const caniuse = proxyquire('../src/caniuse', { 'caniuse-api': caniuseApi });

    caniuse.isSupported();

    t.true(issupportedSpy.calledOnce);

    sandbox.restore();
});
