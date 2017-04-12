/**
 * @fileoverview Minimum functionality a collector must implement in order to be valid.
 *
 * File starts with `_` so it isn't executed by `ava` directly.
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

import test from 'ava';
import * as sinon from 'sinon';
import * as _ from 'lodash';

import { createServer } from '../../helpers/test-server';
import { ICollector, ICollectorBuilder } from '../../../src/lib/interfaces'; // eslint-disable-line no-unused-vars

const testCollector = (collectorBuilder: ICollectorBuilder) => {

    /* eslint-disable sort-keys */
    /** The minimum set of events the collectors need to implement
     *
     * We need to add here the `fetch::error` ones
     */
    const events = [
        ['targetfetch::start', { resource: 'http://localhost/' }],
        ['targetfetch::end', {
            resource: 'http://localhost/',
            request: { url: 'http://localhost/' },
            response: {
                body: fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8'),
                hops: [],
                statusCode: 200,
                url: 'http://localhost/'
            }
        }],
        // TODO: need to know how many traverse::XX we need and how to be consistent among collectors
        // ['traverse::down', 'http://localhost/'],
        // ['traverse::up', 'http://localhost/'],
        ['element::html', { resource: 'http://localhost/' }],
        ['traverse::start', { resource: 'http://localhost/' }],
        ['element::head', { resource: 'http://localhost/' }],
        ['element::title', { resource: 'http://localhost/' }],
        ['element::script', { resource: 'http://localhost/' }],
        ['element::script', { resource: 'http://localhost/' }],
        ['element::style', { resource: 'http://localhost/' }],
        ['element::body', { resource: 'http://localhost/' }],
        ['element::h1', { resource: 'http://localhost/' }],
        ['element::p', { resource: 'http://localhost/' }],
        ['traverse::end', { resource: 'http://localhost/' }],
        ['fetch::start', { resource: 'http://localhost/script3.js' }],
        ['fetch::end', {
            element: {
                getAttribute(attr) {
                    if (attr === 'src') {
                        return '/script3.js';
                    }

                    return '';
                }
            },
            resource: 'http://localhost/script.js',
            request: { url: 'http://localhost/script3.js' },
            response: {
                body: fs.readFileSync(path.join(__dirname, './fixtures/common/script.js'), 'utf8'),
                hops: ['http://localhost/script3.js',
                    'http://localhost/script2.js'],
                statusCode: 200,
                url: 'http://localhost/script.js'
            }
        }],
        ['fetch::start', { resource: 'http://localhost/style.css' }],
        ['fetch::end', {
            element: {
                getAttribute(attr) {
                    if (attr === 'href') {
                        return 'style.css';
                    }

                    return '';
                }
            },
            resource: 'http://localhost/style.css',
            request: { url: 'http://localhost/style.css' },
            response: {
                body: fs.readFileSync(path.join(__dirname, './fixtures/common/style.css'), 'utf8'),
                hops: [],
                statusCode: 200,
                url: 'http://localhost/style.css'
            }
        }]
    ];
    /* eslint-enable sort-keys */

    /** Losely compares to data events. It will check if all the properties in
     * `data2` are in `data1` with the same values.
     */
    const sameData = (actual, expected) => { //eslint-disable-line consistent-return
        const actualType = typeof actual;
        const expectedType = typeof expected;

        // If `expected` doesn't have a value, then it is an enhacement and we can ignore it
        if (actualType !== 'undefined' && expectedType === 'undefined') {
            return true;
        }

        // We test here getAttribute.
        if (expectedType === 'function' && actualType === 'function') {
            return ['src', 'href'].some((attribute) => {
                return actual(attribute) === expected(attribute);
            });
        }

        if (expectedType !== 'object' || actual === null) {
            return actual === expected;
        }

        return _.every(expected, (value, key) => {
            return sameData(actual[key], value);
        });
    };

    const validEvent = (eventsToSearch: Array<any>, expectedEvent) => {
        const originalSize = eventsToSearch.length;

        for (let i = 0; i < eventsToSearch.length; i++) {
            const emittedEvent = eventsToSearch[i];

            if (sameData(emittedEvent, expectedEvent)) {
                eventsToSearch.splice(i, 1);

                break;
            }
        }

        return originalSize !== eventsToSearch.length;
    };


    test.beforeEach(async (t) => {
        const sonar = { emitAsync() { } };
        const collector: ICollector = await (collectorBuilder)(sonar, {});
        const server = createServer();

        sinon.spy(sonar, 'emitAsync');
        t.context.collector = collector;
        t.context.emitAsync = sonar.emitAsync;
        t.context.server = server;
    });

    test.afterEach((t) => {
        t.context.emitAsync.restore();
        t.context.server.stop();
        // Maybe delete the collector?
    });

    /**
     * Updates all references to localhost to use the right port for the current instance.
     *
     * This does a deep search in all the object properties.
     */
    const updateLocalhost = (content, port) => {
        if (typeof content === 'string') {
            return content.replace(/localhost\//g, `localhost:${port}/`);
        }

        if (typeof content === 'number' || !content) {
            return content;
        }

        if (Array.isArray(content)) {
            const transformed = _.map(content, (value) => {
                return updateLocalhost(value, port);
            });

            return transformed;
        }

        const transformed = _.reduce(content, (obj, value, key) => {
            obj[key] = updateLocalhost(value, port);

            return obj;
        }, {});

        return transformed;
    };

    test(async (t) => {
        const collector = <ICollector>t.context.collector;
        const server = t.context.server;

        await server.start();

        server.configure({
            /* JSDOM currently has a bug where link href are not downloaded when passing the HTML because the baseUrl is about:blank
                but scripts are. We need to use http://localhost in the html and also update the reference to use the right port
                More info about the issue https://github.com/tmpvar/jsdom/issues/1801 */
            '/': updateLocalhost(fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8'), server.port),
            '/script.js': fs.readFileSync(path.join(__dirname, './fixtures/common/script.js'), 'utf8'),
            '/script2.js': {
                content: 'script.js',
                status: 302
            },
            '/script3.js': {
                content: 'script2.js',
                status: 302
            },
            '/style.css': fs.readFileSync(path.join(__dirname, './fixtures/common/style.css'), 'utf8')
        });

        const pendingEvents: any = events.map((event) => {
            return updateLocalhost(event, server.port);
        });

        await collector.collect(url.parse(`http://localhost:${server.port}/`));

        const emitAsync = t.context.emitAsync;
        const invokes = [];

        for (let i = 0; i < emitAsync.callCount; i++) {
            invokes.push(emitAsync.getCall(i).args);
        }

        pendingEvents.forEach((event) => {
            t.true(validEvent(invokes, event), `Event ${event[0]} is emitted with ${event[1]}`);
        });
    });
};

export { testCollector };
