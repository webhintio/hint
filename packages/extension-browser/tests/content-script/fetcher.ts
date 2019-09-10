import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { FetchEnd, FetchStart } from 'hint/dist/src/lib/types';

test('Fetcher can match requests to responses', async (t) => {
    const resource = 'http://example.com/site.manifest';
    const missFetchStart = { resource: 'http://example.com/index.htm' } as FetchStart;
    const matchFetchStart = { resource } as FetchStart;
    const missFetchEnd = { request: {}, resource: 'http://example.com/index.htm', response: {} } as FetchEnd;
    const matchFetchEnd = { request: {}, resource, response: { body: { content: 'test content' }, url: resource} } as FetchEnd;
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

    const missStartHandled = fetcher.handle({ fetchStart: missFetchStart });
    const missHandled = fetcher.handle({ fetchEnd: missFetchEnd });
    const matchStartHandled = fetcher.handle({ fetchStart: matchFetchStart });
    const matchHandled = fetcher.handle({ fetchEnd: matchFetchEnd });

    const result = await promise;

    t.true(fetchStub.calledOnce);
    t.false(missStartHandled);
    t.false(missHandled);
    t.true(matchStartHandled);
    t.true(matchHandled);
    t.deepEqual(result, matchFetchEnd);
});

test('Fetcher returns non-CORS responses directly', async (t) => {
    const resource = 'http://example.com/site.manifest';
    const fetchStub = sinon.stub().resolves({
        headers: { forEach() {} },
        text: () => {
            return Promise.resolve('stub content');
        },
        type: 'basic'
    });
    const { Fetcher } = proxyquire(
        '../../src/content-script/fetcher', {
            '../shared/globals': {
                '@noCallThru': true,
                fetch: fetchStub
            }
        }
    ) as typeof import('../../src/content-script/fetcher');

    const fetcher = new Fetcher();

    const result = await fetcher.fetch(resource);

    t.true(fetchStub.calledOnce);
    t.is(result.response.body.content, 'stub content');
});
