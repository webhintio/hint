import test from 'ava';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import * as parse5 from 'parse5';
import * as proxyquire from 'proxyquire';

import { DocumentData } from '@hint/utils-dom';

import { readFixture } from './helpers/fixtures';
import { HostEvents, WorkerEvents } from '../src/shared/types';

type HostListener = (event: { data: WorkerEvents }) => void;
type WorkerListener = (event: { data: HostEvents }) => void;

const base = '../src/content-script';

/**
 * Modules to provide stubbed globals to.
 * Declared in reverse dependency order so the lowest dependency gets
 * overridden with stubbed globals before modules which depend on it.
 */
const paths: { [name: string]: string } = {
    connector: `${base}/connector`,
    webhint: `${base}/webhint`
};

const stubContext = (hostListener: HostListener) => {
    const workerListeners = new Set<WorkerListener>();

    const postMessage = (data: HostEvents) => {
        for (const listener of workerListeners) {
            setTimeout(() => {
                listener({ data });
            }, 0);
        }
    };

    const stubs = {
        '../shared/globals': {
            '@noCallThru': true,
            self: {
                addEventListener(name: string, handler: WorkerListener) {
                    if (name !== 'message') {
                        throw new Error(`Event ${name} has not been stubbed.`);
                    }

                    workerListeners.add(handler);
                },
                postMessage(data: any, origin: string) {
                    setTimeout(() => {
                        hostListener({ data });
                    }, 0);
                },
                removeEventListener(name: string, handler: WorkerListener) {
                    if (name !== 'message') {
                        throw new Error(`Event ${name} has not been stubbed.`);
                    }

                    workerListeners.delete(handler);
                }
            }
        }
    };

    const connector = proxyquire(paths.connector, stubs);

    connector['@noCallThru'] = true;

    proxyquire(paths.webhint, {
        './connector': connector,
        ...stubs
    });

    return { postMessage };
};

test('It runs a basic scan', async (t) => {
    let count = 0;
    const locale = 'en-US';
    const resource = 'http://localhost/';
    const html = await readFixture('button-type.html');

    const snapshot = parse5.parse(html, {
        sourceCodeLocationInfo: true,
        treeAdapter: htmlparser2Adapter
    }) as DocumentData;

    const p = new Promise((resolve) => {
        const { postMessage } = stubContext(({ data }) => {
            count++;

            switch (count) {
                case 1:
                    t.deepEqual(data, { requestConfig: true });
                    postMessage({ config: { locale, resource } });
                    break;
                case 2:
                    t.deepEqual(data, { ready: true });
                    postMessage({ fetchStart: { resource }});
                    postMessage({
                        fetchEnd: {
                            element: null,
                            request: {
                                headers: {} as any,
                                url: resource
                            },
                            resource,
                            response: {
                                body: {
                                    content: html,
                                    rawContent: null as any,
                                    rawResponse: null as any
                                },
                                charset: '',
                                headers: { 'content-type': 'text/html' } as any,
                                hops: [],
                                mediaType: '',
                                statusCode: 200,
                                url: resource
                            }
                        }
                    });
                    postMessage({ snapshot });
                    break;
                case 3:
                    t.deepEqual(data, { done: true });
                    break;
                case 4:
                    t.log(data);
                    t.truthy(data.results);
                    t.truthy(data.results?.length);
                    t.is(data.results?.filter((r) => {
                        return r.hintId === 'button-type';
                    }).length, 1);
                    resolve();
                    break;
                default:
                    t.fail();
            }
        });
    });

    await p;
});
