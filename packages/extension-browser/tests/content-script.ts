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
    'web-async-html': `${base}/web-async-html`,
    connector: `${base}/connector`, // eslint-disable-line sort-keys
    formatter: `${base}/formatter`,
    webhint: `${base}/webhint`
};

let listeners: Set<Function> = new Set();

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
        sendMessage: (evt: Events) => {}
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
                    sendMessage({ enable: config });
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

    Object.keys(paths).forEach((name) => {
        proxyquire(paths[name], stubs);
    });
};

test.beforeEach(() => {
    listeners = new Set();

    Object.keys(paths).forEach((name) => {
        delete require.cache[require.resolve(paths[name])];
    });
});

test.serial('It requests a configuration', (t) => {
    const sandbox = sinon.createSandbox();

    const spy = sandbox.spy(browser.runtime, 'sendMessage');

    stubContext('http://localhost/', '<!doctype html>');

    require(paths.webhint);

    t.true(spy.calledOnce, 'sendMessage was called');
    t.true(spy.args[0][0].requestConfig, 'Configuration was requested');

    sandbox.restore();
});

test.serial('It analyzes a page', async (t) => {
    const url = 'http://localhost/';
    const html = await readFixture('missing-lang.html');

    const resultsPromise = stubEvents({}, () => {
        sendFetch(url, html);
    });

    stubContext(url, html);

    require(paths.webhint);

    const results = await resultsPromise;

    t.true(results.categories.length > 0, 'Returned results');
    t.true(results.categories.some((category) => {
        return category.hints.some((hint) => {
            return hint.problems.some((problem) => {
                return problem.message === '<html> element must have a lang attribute';
            });
        });
    }), 'Reported missing `lang` attribute');
});

test.serial('It configures categories', async (t) => {
    const url = 'http://localhost/test.html';
    const html = await readFixture('missing-lang.html');

    const resultsPromise = stubEvents({ categories: [Category.accessibility] }, () => {
        sendFetch(url, html);
    });

    stubContext(url, html);

    require(paths.webhint);

    const results = await resultsPromise;

    t.is(results.categories.length, 1, 'Restricted to one category');
    t.is(results.categories[0].name, Category.accessibility, 'Category is accessibility');
});

test.serial('It analyzes external resources', async (t) => {
    const url = 'http://localhost/';
    const analyticsURL = 'https://www.google-analytics.com/analytics.js';
    const html = await readFixture('google-analytics.html');

    const resultsPromise = stubEvents({}, () => {
        sendFetch(url, html);
        sendFetch(analyticsURL, '');
    });

    stubContext(url, html);

    require(paths.webhint);

    const results = await resultsPromise;

    t.true(results.categories.length > 0, 'Returned results');
    t.true(results.categories.some((category) => {
        return category.hints.some((hint) => {
            return hint.problems.some((problem) => {
                return problem.resource === analyticsURL;
            });
        });
    }), 'Reported an issue in an external resource');
});

test.serial('It configures ignored urls', async (t) => {
    const url = 'http://localhost/';
    const analyticsURL = 'https://www.google-analytics.com/analytics.js';
    const html = await readFixture('google-analytics.html');

    const resultsPromise = stubEvents({ ignoredUrls: 'google-analytics.com' }, () => {
        sendFetch(url, html);
        sendFetch(analyticsURL, '');
    });

    stubContext(url, html);

    require(paths.webhint);

    const results = await resultsPromise;

    t.true(results.categories.length > 0, 'Returned results');
    t.true(results.categories.every((category) => {
        return category.hints.every((hint) => {
            return hint.problems.every((problem) => {
                return problem.resource !== analyticsURL;
            });
        });
    }), 'Issues in external resource were ignored');
});
