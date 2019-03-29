import { JSDOM } from 'jsdom';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { Category } from 'hint/dist/src/lib/enums/category';
import { FetchEnd } from 'hint/dist/src/lib/types';

import { Config, Events, Results } from '../src/shared/types';

import { readFixture } from './helpers/fixtures';

const base = '../src/content-script';

/**
 * Modules to provide stubbed globals to.
 * Declared in reverse dependency order so the lowest dependency gets
 * overridden with stubbed globals before modules which depend on it.
 */
const paths: { [name: string]: string } = {
    connector: `${base}/connector`,
    formatter: `${base}/formatter`,
    webhint: `${base}/webhint`
};

const mockContext = () => {
    const listeners: Set<Function> = new Set();

    const browser = {
        runtime: {
            onMessage: {
                addListener: (fn: Function) => {
                    listeners.add(fn);
                },
                removeListener: (fn: Function) => {
                    listeners.delete(fn);
                }
            },
            sendMessage: (evt: Events) => { }
        }
    };

    const sendMessage = (event: Events) => {
        listeners.forEach((listener) => {
            listener(event);
        });
    };

    const stubFetchEnd = (url: string, content: string): FetchEnd => {
        return {
            element: null,
            request: {
                headers: {} as any,
                url
            },
            resource: url,
            response: {
                body: {
                    content,
                    rawContent: null as any,
                    rawResponse: null as any
                },
                charset: '',
                headers: {} as any,
                hops: [],
                mediaType: '',
                statusCode: 200,
                url
            }
        };
    };

    const sendFetch = (url: string, content: string) => {
        sendMessage({ fetchStart: { resource: url } });
        sendMessage({ fetchEnd: stubFetchEnd(url, content) });
    };

    const stubEvents = (config: Config, onReady: () => void): Promise<Results> => {
        return new Promise((resolve) => {
            browser.runtime.sendMessage = (event: Events) => {
                if (event.requestConfig) {
                    setTimeout(() => {
                        sendMessage({ config });
                    }, 0);
                }
                if (event.ready) {
                    setTimeout(onReady, 0);
                }
                if (event.results) {
                    resolve(event.results);
                }
            };
        });
    };

    const stubContext = (url: string, html: string) => {
        const dom = new JSDOM(html, { runScripts: 'outside-only', url });

        const stubs = {
            '../shared/globals': {
                '@noCallThru': true,
                browser,
                document: dom.window.document,
                eval: dom.window.eval,
                location: dom.window.location,
                window: dom.window
            }
        };

        const connector = proxyquire(paths.connector, stubs);
        const formatter = proxyquire(paths.formatter, stubs);

        proxyquire(paths.webhint, {
            './connector': connector,
            './formatter': formatter,
            ...stubs
        });
    };

    return {
        browser,
        sendFetch,
        stubContext,
        stubEvents
    };
};

test('It requests a configuration', (t) => {
    const sandbox = sinon.createSandbox();
    const { browser, stubContext } = mockContext();

    const spy = sandbox.spy(browser.runtime, 'sendMessage');

    stubContext('http://localhost/', '<!doctype html>');

    t.true(spy.calledOnce);
    t.true(spy.args[0][0].requestConfig);

    sandbox.restore();
});

test('It analyzes a page', async (t) => {
    const url = 'http://localhost/';
    const html = await readFixture('missing-lang.html');
    const { stubContext, stubEvents, sendFetch } = mockContext();

    const resultsPromise = stubEvents({}, () => {
        sendFetch(url, html);
    });

    stubContext(url, html);

    const results = await resultsPromise;

    t.not(results.categories.length, 0);
    t.true(results.categories.some((category) => {
        return category.hints.some((hint) => {
            return hint.problems.some((problem) => {
                return problem.message === '<html> element must have a lang attribute';
            });
        });
    }), 'Missing `lang` attribute was not reported');
});

test('It configures categories', async (t) => {
    const url = 'http://localhost/test.html';
    const html = await readFixture('missing-lang.html');
    const { stubContext, stubEvents, sendFetch } = mockContext();

    const resultsPromise = stubEvents({ disabledCategories: [Category.accessibility] }, () => {
        sendFetch(url, html);
    });

    stubContext(url, html);

    const results = await resultsPromise;

    t.true(results.categories.every((c) => {
        return c.name !== Category.accessibility;
    }));
});

test('It analyzes external resources', async (t) => {
    const url = 'http://localhost/';
    const analyticsURL = 'https://www.google-analytics.com/analytics.js';
    const html = await readFixture('google-analytics.html');
    const { stubContext, stubEvents, sendFetch } = mockContext();

    const resultsPromise = stubEvents({}, () => {
        sendFetch(url, html);
        sendFetch(analyticsURL, '');
    });

    stubContext(url, html);

    const results = await resultsPromise;

    t.not(results.categories.length, 0);
    t.true(results.categories.some((category) => {
        return category.hints.some((hint) => {
            return hint.problems.some((problem) => {
                return problem.resource === analyticsURL;
            });
        });
    }), 'Issue in external resource was not reported');
});

test('It configures ignored urls', async (t) => {
    const url = 'http://localhost/';
    const analyticsURL = 'https://www.google-analytics.com/analytics.js';
    const html = await readFixture('google-analytics.html');
    const { stubContext, stubEvents, sendFetch } = mockContext();

    const resultsPromise = stubEvents({ ignoredUrls: 'google-analytics.com' }, () => {
        sendFetch(url, html);
        sendFetch(analyticsURL, '');
    });

    stubContext(url, html);

    const results = await resultsPromise;

    t.not(results.categories.length, 0);
    t.true(results.categories.every((category) => {
        return category.hints.every((hint) => {
            return hint.problems.every((problem) => {
                return problem.resource !== analyticsURL;
            });
        });
    }), 'Issues in external resource were not ignored');
});

test('It handles invalid ignored urls', async (t) => {
    const url = 'http://localhost/';
    const html = await readFixture('missing-lang.html');
    const { stubContext, stubEvents, sendFetch } = mockContext();

    const resultsPromise = stubEvents({ ignoredUrls: '(foo' }, () => {
        sendFetch(url, html);
    });

    stubContext(url, html);

    const results = await resultsPromise;

    t.not(results.categories.length, 0);
});

test('It handles invalid browserslist queries', async (t) => {
    const url = 'http://localhost/';
    const html = await readFixture('missing-lang.html');
    const { stubContext, stubEvents, sendFetch } = mockContext();
    const resultsPromise = stubEvents({ browserslist: 'foo' }, () => {
        sendFetch(url, html);
    });

    stubContext(url, html);

    const results = await resultsPromise;

    t.not(results.categories.length, 0);
});
