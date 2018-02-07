/**
 * @fileoverview Minimum event functionality a connector must implement
 * in order to be valid.
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as zlib from 'zlib';

import * as _ from 'lodash';
import * as sinon from 'sinon';
import test from 'ava';

import { builders } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { IConnector, IConnectorBuilder } from '../../../src/lib/types';

const sourceHtml = fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8');

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


test.beforeEach(async (t) => {
    const sonarwhal = {
        emit() { },
        emitAsync() { }
    };

    sinon.spy(sonarwhal, 'emitAsync');
    sinon.spy(sonarwhal, 'emit');

    const server = createServer();

    await server.start();

    const html = updateLocalhost(sourceHtml, server.port);
    const gzipHtml = zlib.gzipSync(Buffer.from(html));

    t.context = {
        gzipHtml,
        html,
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

const findEvent = (func, eventName) => {
    for (let i = 0; i < func.callCount; i++) {
        const args = func.getCall(i).args;

        if (args[0] === eventName) {
            return args[1];
        }
    }

    return null;
};

const testRequestResponse = (connectorInfo) => {
    const connectorBuilder: IConnectorBuilder = connectorInfo.builder;
    const name: string = connectorInfo.name;

    test(`[${name}] requestResponse`, async (t) => {
        const { sonarwhal } = t.context;
        const { emit, emitAsync } = sonarwhal;
        const connector: IConnector = await (connectorBuilder)(sonarwhal, {});
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

        await connector.collect(url.parse(`http://localhost:${server.port}/`));

        const invokedTargetFetchEnd = findEvent(emitAsync, 'targetfetch::end') || findEvent(emit, 'targetfetch::end');
        /* eslint-disable sort-keys */
        const expectedTargetFetchEnd = {
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

        if (!invokedTargetFetchEnd) {
            t.fail(`targetfetch::end' event not found`);

            return;
        }

        const { body: invokedBody } = invokedTargetFetchEnd.response;
        const { body: expectedBody } = expectedTargetFetchEnd.response;
        const [invokedRawResponse, expectedRawResponse] = await Promise.all([invokedBody.rawResponse(), expectedBody.rawResponse()]);

        t.true(expectedRawResponse.equals(invokedRawResponse), 'rawResponses are different');
        t.true(expectedBody.content === invokedBody.content, 'content is different');
        t.true(expectedBody.rawContent.equals(invokedBody.rawContent), 'rawContent is different');
    });
};

builders.forEach((connector) => {
    testRequestResponse(connector);
});
