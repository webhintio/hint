import * as puppeteer from 'puppeteer';

import { FetchEnd } from 'hint';
import { Server } from '@hint/utils-create-server';
import { createHelpers, DocumentData } from '@hint/utils-dom';
import { Problem } from '@hint/utils-types';

import { WorkerEvents, HostEvents, Config, Resource } from '../../src/shared/types';
import { Test, RunResult } from './types';
import { readFile } from './fixtures';

declare const __webhint: {
    snapshotDocument(document: Document): DocumentData;
};

const runWorker = async (page: puppeteer.Page, config: Partial<Config>, test: Test) => {
    return await page.evaluate((config: Partial<Config>, test: Test) => {
        const testUrl = 'https://example.com/';

        const getResourceContentType = (type: string) => {
            switch (type) {
                case 'css':
                    return 'text/css';
                case 'js':
                    return 'text/javascript';
                default:
                    return 'text/plain';
            }
        };

        const mockFetchEnd = (): FetchEnd => {
            return {
                element: null,
                request: {
                    headers: {},
                    url: testUrl
                },
                resource: testUrl,
                response: {
                    body: {
                        content: test.html,
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
                    url: testUrl
                }
            };
        };

        const mockResourceFetchEnd = (resource: Resource): FetchEnd => {
            return {
                element: null,
                request: {
                    headers: {},
                    url: testUrl
                },
                resource: testUrl,
                response: {
                    body: {
                        content: resource.content,
                        rawContent: null as any,
                        rawResponse: null as any
                    },
                    charset: '',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': getResourceContentType(resource.type)
                    },
                    hops: [],
                    mediaType: '',
                    statusCode: 200,
                    url: testUrl
                }
            };
        };

        return new Promise<RunResult>((resolve, reject) => {
            const worker = new Worker('./webhint.js');
            let results: Problem[] = [];
            let startTime: number;
            let endTime: number;
            let resultsTimeout: NodeJS.Timeout = 0 as any;

            let timeoutId: NodeJS.Timeout | null = test.timeout ? setTimeout(() => {
                reject(new Error('timeout'));
            }, test.timeout) : null;

            const sendMessage = (message: HostEvents) => {
                worker.postMessage(message);
            };

            worker.addEventListener('message', (event) => {
                const message: WorkerEvents = event.data;

                if (message.requestConfig) {
                    sendMessage({
                        config: {
                            resource: testUrl,
                            ...config
                        }
                    });
                } else if (message.ready) {
                    startTime = performance.now();
                    sendMessage({ fetchStart: { resource: testUrl } });
                    sendMessage({ fetchEnd: mockFetchEnd() });
                    if (test.resources && test.resources.length > 0) {
                        for (const resource of test.resources) {
                            sendMessage({ fetchEnd: mockResourceFetchEnd(resource) });
                        }
                    }
                    sendMessage({ snapshot: __webhint.snapshotDocument(document) });
                } else if (message.error) {
                    const error = new Error(message.error.message);

                    error.stack = message.error.stack;

                    reject(error);

                    return;
                } else if (message.results) {
                    endTime = performance.now();
                    results = [...results, ...message.results];

                    // Wait until the result we are expecting is returned.
                    if (test.expectedHints) {
                        const found = test.expectedHints.every((expectedHint) => {
                            return results && results.some((problem) => {
                                return problem.hintId === expectedHint;
                            });
                        });

                        if (found) {
                            if (timeoutId) {
                                clearTimeout(timeoutId);
                                timeoutId = null;
                            }
                            resolve({
                                problems: results,
                                totalTime: endTime - startTime
                            });

                            return;
                        }
                    } else {
                        clearTimeout(resultsTimeout);
                        resultsTimeout = setTimeout(() => {
                            resolve({
                                problems: results,
                                totalTime: endTime - startTime
                            });
                        }, 1000);
                    }
                }
            });
        });
    }, config as any, test as any);
};

export const getResults = async (config: Partial<Config>, test: Test, log: typeof console.log) => {
    const webhint = await readFile('../../webhint.js');
    const content = test.html;

    const resourceEndpoints: { [path: string]: string } = {};

    if (test.resources && test.resources.length > 0) {
        for (const { content, path } of test.resources) {
            resourceEndpoints[path] = content;
        }
    }

    const server = await Server.create({
        configuration: {
            '/': content,
            '/webhint.js': {
                content: webhint,
                headers: { 'Content-Type': 'text/javascript' }
            },
            ...resourceEndpoints
        }
    });

    const url = `http://localhost:${server.port}/`;
    const browser = await puppeteer.launch();
    const page = (await browser.pages())[0];

    await page.goto(url);

    page.on('pageerror', (e) => {
        if (log) {
            log('Page Error: ', e);
        }
    });

    page.on('console', (e) => {
        if (log) {
            log(e.type(), e.text());
        }
    });

    await page.evaluate(`(${createHelpers})()`);

    const result = await runWorker(page, config, test);

    await browser.close();
    await server.stop();

    return result;
};
