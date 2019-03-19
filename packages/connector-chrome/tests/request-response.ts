/**
 * @fileoverview Minimum event functionality a connector must implement
 * in order to be valid.
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import * as zlib from 'zlib';

import * as sinon from 'sinon';
import test from 'ava';
import { Server } from '@hint/utils-create-server';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import ChromeConnector from '../src/connector';

const name: string = 'chrome';

const findEvent = (func: sinon.SinonSpy<any, any>, eventName: string) => {
    for (let i = 0; i < func.callCount; i++) {
        const args = func.getCall(i).args;

        if (args[0] === eventName) {
            return args[1];
        }
    }

    return null;
};

test(`[${name}] requestResponse`, async (t) => {
    const sourceHtml = fs.readFileSync(path.join(__dirname, './fixtures/common/index.html'), 'utf8');

    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        on(): Engine {
            return null as any;
        }
    } as any;

    const engineEmitAsyncSpy = sinon.spy(engine, 'emitAsync');
    const engineEmitSpy = sinon.spy(engine, 'emit');

    const connector: IConnector = new ChromeConnector(engine, {});
    const server = await Server.create();

    const html = Server.updateLocalhost(sourceHtml, server.port);
    const gzipHtml = zlib.gzipSync(Buffer.from(html));

    await server.configure({
        '/': {
            content: gzipHtml,
            headers: {
                'content-encoding': 'gzip',
                'content-type': 'text/html'
            }
        }
    });

    await connector.collect(new URL(`http://localhost:${server.port}/`));

    const invokedFetchEnd = findEvent(engineEmitAsyncSpy, 'fetch::end::html') || findEvent(engineEmitSpy, 'fetch::end::html');
    /* eslint-disable sort-keys */
    const expectedFetchEnd = {
        resource: `http://localhost:${server.port}/`,
        request: { url: `http://localhost:${server.port}/` },
        response: {
            body: {
                content: html,
                rawContent: Buffer.from(html),
                rawResponse() {
                    return Promise.resolve(gzipHtml);
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

    await Promise.all([connector.close(), server.stop()]);
});
