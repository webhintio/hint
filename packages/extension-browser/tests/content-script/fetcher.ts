import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { FetchEnd } from 'hint/dist/src/lib/types';

test('Fetcher can match requests to responses', async (t) => {
    const resource = 'http://example.com/site.manifest';
    const missFetchEnd = { request: {}, resource: 'http://example.com/index.htm', response: {} } as FetchEnd;
    const matchFetchEnd = { request: {}, resource, response: { body: { content: 'test content' }} } as FetchEnd;
    const fetchStub = sinon.stub().resolves({});
    const { Fetcher } = proxyquire(
        '../../src/content-script/fetcher', {
            '../shared/globals': {
                '@noCallThru': true,
                fetch: fetchStub
            }
        }
    ) as typeof import('../../src/content-script/fetcher');

    const fetcher = new Fetcher();

    const promise = fetcher.fetch(resource);

    const missHandled = fetcher.handle({ fetchEnd: missFetchEnd });
    const matchHandled = fetcher.handle({ fetchEnd: matchFetchEnd });

    const result = await promise;

    t.true(fetchStub.calledOnce);
    t.false(missHandled);
    t.true(matchHandled);
    t.deepEqual(result, matchFetchEnd);
});
