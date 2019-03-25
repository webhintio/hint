import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { } from '../../src/network/request-async';

test('requestAsync should fails if the request fails', async (t) => {
    const requestStub = sinon.stub();
    const { requestAsync } = proxyquire('../../src/network/request-async', { request: requestStub });

    requestStub.callsFake((options, callback) => {
        callback('error');
    });

    t.plan(1);
    try {
        await requestAsync();
    } catch (err) {
        t.is(err, 'error');
    }
});

test('requestAsync should works if the request works', async (t) => {
    const requestStub = sinon.stub();
    const { requestAsync } = proxyquire('../../src/network/request-async', { request: requestStub });

    requestStub.callsFake((options, callback) => {
        callback(null, null, 'result');
    });

    const result = await requestAsync({ url: 'https://example.com' });

    t.is(result, 'result');
});
