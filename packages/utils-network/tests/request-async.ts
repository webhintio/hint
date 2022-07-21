import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

test.only('requestAsync should fails if the request fails', async (t) => {

    const fetchStub = sinon.stub();
    const { requestAsync } = proxyquire('../src/request-async', {'node-fetch': { default: fetchStub }});
    const expectedError = new Error('expected error');

    fetchStub.callsFake((options) => {
        throw expectedError;
    });

    t.plan(1);
    try {
        await requestAsync('https://example.com');
    } catch (err) {
        t.is(err, expectedError);
    }
});

test('requestAsync should works if the request works', async (t) => {
    const fetchStub = sinon.stub();
    const { requestAsync } = proxyquire('../src/request-async', {'node-fetch': { default: fetchStub }});

    fetchStub.callsFake((options) => {
        return { body: 'result' };
    });

    t.plan(1);
    try {
        const result = await requestAsync('https://example.com');

        t.is(result, 'result');
    } catch (err) {
        t.fail(`Not expecting an exception: ${err}`);
    }
});
