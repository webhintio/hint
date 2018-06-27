/**
 * @fileoverview Minimum event functionality a connector must implement
 * in order to be valid.
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import * as zlib from 'zlib';

import { map, reduce } from 'lodash';
import * as sinon from 'sinon';
import test from 'ava';

import { createServer } from '@hint/utils-create-server';
import { IConnector } from 'hint/dist/src/lib/types';
import JSDOMConnector from '../src/connector';

const name: string = 'jsdom';

const sourceHtml = fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8');

/**
 * Updates all references to localhost to use the right port for the current instance.
 *
 * This does a deep search in all the object properties.
 */
const updateLocalhost = (content: any, port: any): any => {
    if (typeof content === 'string') {
        return content.replace(/localhost\//g, `localhost:${port}/`);
    }

    if (typeof content === 'number' || !content) {
        return content;
    }

    if (Array.isArray(content)) {
        const transformed = map(content, (value) => {
            return updateLocalhost(value, port);
        });

        return transformed;
    }

    const transformed = reduce(content, (obj: any, value, key) => {
        obj[key] = updateLocalhost(value, port);

        return obj;
    }, {});

    return transformed;
};


test.beforeEach(async (t) => {
    const engine = {
        emit() { },
        emitAsync() { }
    };

    sinon.spy(engine, 'emitAsync');
    sinon.spy(engine, 'emit');

    const server = createServer();

    await server.start();

    const html = updateLocalhost(sourceHtml, server.port);
    const gzipHtml = zlib.gzipSync(Buffer.from(html));

    t.context = {
        engine,
        gzipHtml,
        html,
        server
    };
});

test.afterEach.always(async (t) => {
    t.context.engine.emitAsync.restore();
    t.context.engine.emit.restore();
    t.context.server.stop();
    await t.context.connector.close();
});

const findEvent = (func: sinon.SinonSpy, eventName: string) => {
    for (let i = 0; i < func.callCount; i++) {
        const args = func.getCall(i).args;

        if (args[0] === eventName) {
            return args[1];
        }
    }

    return null;
};

test(`[${name}] requestResponse`, async (t) => {
    const { engine } = t.context;
    const { emit, emitAsync } = engine;
    const connector: IConnector = new JSDOMConnector(engine, {});
    const server = t.context.server;

    t.context.connector = connector;

    server.configure({
        '/': {
            content: t.context.gzipHtml,
            headers: {
                'content-encoding': 'gzip',
                'content-type': 'text/html'
            }
        }
    });

    await connector.collect(new URL(`http://localhost:${server.port}/`));

    const invokedFetchEnd = findEvent(emitAsync, 'fetch::end::html') || findEvent(emit, 'fetch::end::html');
    /* eslint-disable sort-keys */
    const expectedFetchEnd = {
        resource: `http://localhost:${server.port}/`,
        request: { url: `http://localhost:${server.port}/` },
        response: {
            body: {
                content: t.context.html,
                rawContent: Buffer.from(t.context.html),
                rawResponse() {
                    return Promise.resolve(t.context.gzipHtml);
                }
            },
            charset: 'utf-8',
            hops: [],
            mediaType: 'text/html',
            statusCode: 200,
            url: 'http://localhost/'
        }
    };
    /* eslint-enable sort-keys */

    if (!invokedFetchEnd) {
        t.fail(`fetch::end::html' event not found`);

        return;
    }

    const { body: invokedBody } = invokedFetchEnd.response;
    const { body: expectedBody } = expectedFetchEnd.response;
    const [invokedRawResponse, expectedRawResponse] = await Promise.all([invokedBody.rawResponse(), expectedBody.rawResponse()]);

    t.true(expectedRawResponse.equals(invokedRawResponse), 'rawResponses are different');
    t.true(expectedBody.content === invokedBody.content, 'content is different');
    t.true(expectedBody.rawContent.equals(invokedBody.rawContent), 'rawContent is different');
});
