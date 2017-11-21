/**
 * @fileoverview Minimum event functionality a connector must implement
 * in order to be valid.
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

import * as _ from 'lodash';
import * as sinon from 'sinon';
import test from 'ava';

import { builders } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { IConnector, IConnectorBuilder } from '../../../src/lib/types';


/* eslint-disable sort-keys */
/** The minimum set of events the connectors need to implement. */
const events = [
    ['scan::start', { resource: 'http://localhost/' }],
    ['targetfetch::start', { resource: 'http://localhost/' }],
    ['targetfetch::end', {
        resource: 'http://localhost/',
        request: { url: 'http://localhost/' },
        response: {
            body: {
                content: fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8'),
                contentEncoding: null,
                rawContent: null,
                rawResponse: null
            },
            hops: [],
            statusCode: 200,
            url: 'http://localhost/'
        }
    }],
    /*
     * TODO: need to know how many traverse::XX we need and how to be consistent among connectors
     * ['traverse::down', 'http://localhost/'],
     * ['traverse::up', 'http://localhost/'],
     */
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
            body: {
                content: fs.readFileSync(path.join(__dirname, './fixtures/common/script.js'), 'utf8'),
                contentEncoding: null,
                rawContent: null,
                rawResponse: null
            },
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
            body: {
                content: fs.readFileSync(path.join(__dirname, './fixtures/common/style.css'), 'utf8'),
                contentEncoding: null,
                rawContent: null,
                rawResponse: null
            },
            hops: [],
            statusCode: 200,
            url: 'http://localhost/style.css'
        }
    }],
    ['fetch::start', { resource: 'http://localhost/script4.js' }],
    ['fetch::end', {
        element: {
            getAttribute(attr) {
                if (attr === 'href') {
                    return '/script4.js';
                }

                return '';
            }
        },
        resource: 'http://localhost/script4.js',
        request: { url: 'http://localhost/script4.js' },
        response: {
            statusCode: 404,
            url: 'http://localhost/script4.js'
        }
    }],
    ['fetch::error', {
        element: {
            getAttribute(attr) {
                if (attr === 'href') {
                    return 'test://fa.il';
                }

                return '';
            }
        },
        resource: 'test://fa.il',
        hops: ['http://localhost/script5.js']
    }],
    ['manifestfetch::missing', { resource: 'http://localhost/' }],
    ['scan::end', { resource: 'http://localhost/' }]
];
/* eslint-enable sort-keys */

/**
 * Losely compares to data events. It will check if all the properties in
 * `data2` are in `data1` with the same values.
 */
const sameData = (actual, expected) => {
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
    const sonarwhal = {
        emit() { },
        emitAsync() { }
    };

    sinon.spy(sonarwhal, 'emitAsync');
    sinon.spy(sonarwhal, 'emit');

    const server = createServer();

    await server.start();

    t.context = {
        server,
        sonarwhal
    };
});

test.afterEach.always(async (t) => {
    t.context.sonarwhal.emitAsync.restore();
    t.context.sonarwhal.emit.restore();
    t.context.server.stop();
    await t.context.connector.close();
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

const testConnectorEvents = (connectorInfo) => {
    const connectorBuilder: IConnectorBuilder = connectorInfo.builder;
    const name: string = connectorInfo.name;

    test(`[${name}] Events`, async (t) => {
        const { sonarwhal } = t.context;
        const connector: IConnector = await (connectorBuilder)(sonarwhal, {});
        const server = t.context.server;

        t.context.connector = connector;

        server.configure({
            '/': updateLocalhost(fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8'), server.port),
            '/nellie.png': { content: fs.readFileSync(path.join(__dirname, './fixtures/common/nellie.png')) },
            '/script.js': fs.readFileSync(path.join(__dirname, './fixtures/common/script.js'), 'utf8'),
            '/script2.js': {
                content: 'script.js',
                status: 302
            },
            '/script3.js': {
                content: 'script2.js',
                status: 302
            },
            '/script4.js': {
                content: 'script4.js',
                status: 404
            },
            '/script5.js': null,
            '/style.css': fs.readFileSync(path.join(__dirname, './fixtures/common/style.css'), 'utf8')
        });

        const pendingEvents: any = events.map((event) => {
            return updateLocalhost(event, server.port);
        });

        await connector.collect(url.parse(`http://localhost:${server.port}/`));

        const { emit, emitAsync } = t.context.sonarwhal;
        const invokes = [];

        for (let i = 0; i < emitAsync.callCount; i++) {
            invokes.push(emitAsync.getCall(i).args);
        }

        for (let i = 0; i < emit.callCount; i++) {
            invokes.push(emit.getCall(i).args);
        }

        // List of events that only have to be called once per execution
        const singles = ['fetch::error', 'scan::start', 'scan::end', 'manifestfetch::missing', 'targetfetch::start', 'targetfetch::end'];
        const groupedEvents = _.groupBy(invokes, (invoke) => {
            return invoke[0];
        });

        singles.forEach((single) => {
            t.is(groupedEvents[single] && groupedEvents[single].length, 1, `${single} should be called once`);
        });

        pendingEvents.forEach((event) => {
            t.true(validEvent(invokes, event), `Event ${event[0]}/${event[1].resource} has the same properties`);
        });
    });
};

builders.forEach((connector) => {
    testConnectorEvents(connector);
});
