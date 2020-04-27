import { launch, Page } from 'puppeteer';
import test, { ExecutionContext } from 'ava';

import { createHelpers, DocumentData } from '@hint/utils-dom';
import { Problem } from '@hint/utils-types';
import { Server } from '@hint/utils-create-server';

import { WorkerEvents, HostEvents, Config } from '../src/shared/types';

import { readFile } from './helpers/fixtures';
import { FetchEnd } from 'hint';

declare const __webhint: {
    snapshotDocument(document: Document): DocumentData;
};

const runWorker = async (page: Page, content: string, config: Partial<Config>) => {
    return await page.evaluate((content: string, config: Partial<Config>) => {

        const mockFetchEnd = (): FetchEnd => {
            return {
                element: null,
                request: {
                    headers: {},
                    url: location.href
                },
                resource: location.href,
                response: {
                    body: {
                        content,
                        rawContent: null as any,
                        rawResponse: null as any
                    },
                    charset: '',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'text/html;charset=utf-8'
                    },
                    hops: [],
                    mediaType: '',
                    statusCode: 200,
                    url: location.href
                }
            };
        };

        return new Promise<Problem[]>((resolve) => {
            const worker = new Worker('./webhint.js');
            let results: Problem[] = [];
            let resultsTimeout: NodeJS.Timeout = 0 as any;

            const sendMessage = (message: HostEvents) => {
                worker.postMessage(message);
            };

            worker.addEventListener('message', (event) => {
                const message: WorkerEvents = event.data;

                if (message.requestConfig) {
                    sendMessage({
                        config: {
                            resource: location.href,
                            ...config
                        }
                    });
                } else if (message.ready) {
                    sendMessage({ fetchStart: { resource: location.href }});
                    sendMessage({ fetchEnd: mockFetchEnd() });
                    sendMessage({ snapshot: __webhint.snapshotDocument(document) });
                } else if (message.error) {
                    const error = new Error(message.error.message);

                    error.stack = message.error.stack;

                    throw error;
                } else if (message.results) {
                    results = [...results, ...message.results];

                    // Wait a bit for additional results
                    clearTimeout(resultsTimeout);
                    resultsTimeout = setTimeout(() => {
                        resolve(results);
                    }, 1000);
                }
            });
        });
    }, content, config as any);
};

const getResults = async (t: ExecutionContext, fixture: string, config: Partial<Config>) => {
    const webhint = await readFile('../../webhint.js');
    const content = await readFile(fixture);
    const server = await Server.create({
        configuration: {
            '/': content,
            '/webhint.js': {
                content: webhint,
                headers: { 'Content-Type': 'text/javascript' }
            }
        }
    });
    const url = `http://localhost:${server.port}/`;
    const browser = await launch();
    const page = (await browser.pages())[0];

    await page.goto(url);

    page.on('pageerror', (e) => {
        t.log('Page Error: ', e);
    });

    page.on('console', (e) => {
        t.log(e.type(), e.text());
    });

    await page.evaluate(`(${createHelpers})()`);

    const results = await runWorker(page, content, config);

    t.log(results);

    await browser.close();
    await server.stop();

    return results;
};

test('It runs in a real web worker', async (t) => {
    const results = await getResults(t, 'fixtures/basic-hints.html', { userConfig: { language: 'en-us' } });

    const xContentTypeOptionsResults = results.filter((problem) => {
        return problem.hintId === 'x-content-type-options';
    });

    // Validate a `fetch::end` related hint
    t.is(xContentTypeOptionsResults.length, 1);

    const axeLanguageResults = results.filter((problem) => {
        return problem.hintId === 'axe/language';
    });

    // Validate a `can-evaluate::script` related hint
    t.is(axeLanguageResults.length, 1);

    const compatHtmlResults = results.filter((problem) => {
        return problem.hintId === 'compat-api/html';
    });

    // Validate a `traverse` related hint
    t.is(compatHtmlResults.length, 1);
});

test('It respects provided configuration', async (t) => {
    const results = await getResults(t, 'fixtures/basic-hints.html', {
        userConfig: {
            hints: {
                'axe/language': 'off',
                'compat-api/html': ['default', { ignore: ['dialog'] }]
            },
            language: 'en-us'
        }
    });

    const axeLanguageResults = results.filter((problem) => {
        return problem.hintId === 'axe/language';
    });

    // Validate `axe/language` was disabled
    t.is(axeLanguageResults.length, 0);

    const compatHtmlResults = results.filter((problem) => {
        return problem.hintId === 'compat-api/html';
    });

    // Validate `compat-api/html` was configured
    t.is(compatHtmlResults.length, 0);
});

test('It allows disabling hints by default', async (t) => {
    const results = await getResults(t, 'fixtures/basic-hints.html', {
        defaultHintSeverity: 'off',
        userConfig: {
            hints: { 'compat-api/html': 'default' },
            language: 'en-us'
        }
    });

    const axeLanguageResults = results.filter((problem) => {
        return problem.hintId === 'axe/language';
    });

    // Validate `axe/language` was disabled
    t.is(axeLanguageResults.length, 0);

    const compatHtmlResults = results.filter((problem) => {
        return problem.hintId === 'compat-api/html';
    });

    // Validate `compat-api/html` was configured
    t.is(compatHtmlResults.length, 1);
});
