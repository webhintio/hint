import { launch, Page } from 'puppeteer';
import test from 'ava';

import { createHelpers, DocumentData } from '@hint/utils-dom';
import { Problem } from '@hint/utils-types';
import { Server } from '@hint/utils-create-server';

import { WorkerEvents, HostEvents } from '../src/shared/types';

import { readFile } from './helpers/fixtures';
import { FetchEnd } from 'hint';

declare const __webhint: {
    snapshotDocument(document: Document): DocumentData;
};

const runWorker = async (page: Page, content: string) => {
    return await page.evaluate((content: string) => {

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
            let resultCount = 0;

            const sendMessage = (message: HostEvents) => {
                worker.postMessage(message);
            };

            worker.addEventListener('message', (event) => {
                const message: WorkerEvents = event.data;

                if (message.requestConfig) {
                    sendMessage({
                        config: {
                            locale: 'en-us',
                            resource: location.href
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
                    resultCount++;

                    if (resultCount === 2) {
                        resolve(results);
                    }
                }
            });
        });
    }, content);
};

test('It runs in a real web worker', async (t) => {
    const webhint = await readFile('../bundle/webhint.js');
    const content = await readFile('fixtures/button-type.html');
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

    const results = await runWorker(page, content);

    t.log(results);

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

    const buttonTypeResults = results.filter((problem) => {
        return problem.hintId === 'button-type';
    });

    // Validate a `traverse` related hint
    t.is(buttonTypeResults.length, 1);

    await browser.close();
    server.stop();
});
