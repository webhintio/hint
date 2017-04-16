/* eslint-disable no-sync */

import * as zlib from 'zlib';

import * as pify from 'pify';
import * as iconv from 'iconv-lite';

import test from 'ava';
import { createServer } from '../../../helpers/test-server';
import { Requester } from '../../../../src/lib/collectors/utils/requester';
import { INetworkData } from '../../../../src/lib/interfaces';

const compress = pify(zlib.gzip);
const text = `This is a text
    with several characters <> "'
    áéíóúàèìòùâêîôûäëïöü`;

test.beforeEach(async (t) => {
    const server = createServer();
    const requester = new Requester();

    await server.start();

    t.context.server = server;
    t.context.requester = requester;
});

test.afterEach((t) => {
    const { server } = t.context;

    server.stop();
});

// ------------------------------------------------------------------------------
// Encoding tests
// ------------------------------------------------------------------------------

/** Supported encodings to test. `iconv-lite` supports more (as well as us)
 * but these are the most common that we want to verify
 * https://github.com/MicrosoftEdge/Sonar/issues/89#issuecomment-292480515
 *
 */
const supportedEncodings = [
    'utf-8',
    'iso-8859-1',
    'windows-1251'
];

const contentTypes = [
    'application/javascript',
    'application/json',
    'application/x-javascript',
    'application/xml',
    'application/xhtml+xml',
    'application/something+json',
    'image/svg+xml',
    'text/html',
    'text/something'
];

/** This function verifies that we can decode the bytes for the expected `Content-Type`s
 * and the supported `charset`s, even when the server response is compressed.
 * */
const testTextDecoding = async (t, encoding: string, contentType: string, useCompression: boolean) => {
    const { requester, server } = t.context;
    const originalBytes = iconv.encode(text, encoding);
    const transformedText = iconv.decode(originalBytes, encoding);
    const content = useCompression ? await compress(originalBytes) : originalBytes;

    server.configure({
        '/': {
            content,
            headers: {
                'Content-Encoding': useCompression ? 'gzip' : 'identity',
                'Content-Type': `${contentType}; charset=${encoding}`
            }
        }
    });

    const { response: { body, rawBody, rawBodyResponse } } = await requester.get(`http://localhost:${server.port}`);

    // body is a `string`
    t.is(body, transformedText);
    // rawBody is a `Buffer` with the uncompressed bytes of the response
    t.deepEqual(rawBody, originalBytes);
    // rawBodyResponse is a `Buffer` with the original bytes of the response
    t.deepEqual(rawBodyResponse, content);
};

supportedEncodings.forEach((encoding) => {
    contentTypes.forEach((contentType) => {
        test(`requester handles ${encoding}`, testTextDecoding, encoding, contentType, false);
        test(`requester handles ${encoding}`, testTextDecoding, encoding, contentType, true);
    });
});

// ------------------------------------------------------------------------------
// Binary Content-Types
// ------------------------------------------------------------------------------

const binTypes = [
    'image/jpeg',
    'image/png'
];

/** This function verifies that no decoding is done if `Content-Type` doesn't expect it. */
const testBinaries = async (t, binType) => {
    const { requester, server } = t.context;

    const content = iconv.encode(text, 'iso-8859-1');

    server.configure({
        '/': {
            content,
            headers: { 'Content-Type': `${binType}; charset=iso-8859-1` }
        }
    });

    const { response: { rawBody, body } } = await requester.get(`http://localhost:${server.port}`);

    t.deepEqual(rawBody, content);
    // Body should be null
    t.is(body, null);
};

binTypes.forEach((binType) => {
    test(`requester doesn't transform content for ${binType}`, testBinaries, binType);
});

// ------------------------------------------------------------------------------
// Hops
// ------------------------------------------------------------------------------

const hopsServerConfig = {
    '/': 'Final destination',
    '/hop301': {
        content: 'hop302',
        status: 301
    },
    '/hop302': {
        content: 'hop303',
        status: 302
    },
    '/hop303': {
        content: 'hop307',
        status: 303
    },
    '/hop307': {
        content: 'hop308',
        status: 307
    },
    '/hop308': {
        content: '/',
        status: 308
    }
};

test(`Requester follows all hops, reports the right number and returns the final string content`, async (t) => {
    const { requester, server } = t.context;

    server.configure(hopsServerConfig);

    const { response } = await <INetworkData>requester.get(`http://localhost:${server.port}/hop301`);

    t.is(response.hops.length, Object.keys(hopsServerConfig).length - 1);
    t.is(response.body, hopsServerConfig['/']);
});
