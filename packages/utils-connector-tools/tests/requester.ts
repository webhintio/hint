import { promisify } from 'util';
import * as zlib from 'zlib';

import * as iconv from 'iconv-lite';
import * as brotli from 'iltorb';
import anyTest, { TestInterface, ExecutionContext } from 'ava';
import { Server } from '@hint/utils-create-server';
import { NetworkData } from 'hint/dist/src/lib/types';

import { Requester } from '../src/requester';

type RequesterContext = {
    requester: Requester;
};

const test = anyTest as TestInterface<RequesterContext>;

const compressGzip: Function = promisify(zlib.gzip) as any;
const compressBrotli: Function = promisify(brotli.compress) as any;
const compress = {
    br: compressBrotli,
    gzip: compressGzip
};

const text = `This is a text
    with several characters <> "'
    áéíóúàèìòùâêîôûäëïöü`;

test.beforeEach((t) => {
    const requester = new Requester();

    t.context.requester = requester;
});

/*
 * ------------------------------------------------------------------------------
 * Encoding tests
 * ------------------------------------------------------------------------------
 */

/**
 * Supported encodings to test. `iconv-lite` supports more (as well as us)
 * but these are the most common that we want to verify
 * https://github.com/webhintio/hint/issues/89#issuecomment-292480515
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

/**
 * This function verifies that we can decode the bytes for the expected `Content-Type`s
 * and the supported `charset`s, even when the server response is compressed.
 *
 */
const testTextDecoding = async (t: ExecutionContext<RequesterContext>, encoding: string, contentType: string, compression?: 'gzip' | 'br') => {
    const { requester } = t.context;

    const originalBytes = iconv.encode(text, encoding);
    const transformedText = iconv.decode(originalBytes, encoding);
    const content: Buffer = compression ?
        await compress[compression](originalBytes) :
        originalBytes;

    const server = await Server.create({
        configuration: {
            '/': {
                content,
                headers: {
                    'Content-Encoding': compression ? compression : 'identity',
                    'Content-Type': `${contentType}; charset=${encoding}`
                }
            }
        }
    });

    const { response: { body } } = await requester.get(`http://localhost:${server.port}`);
    const rawResponse = await body.rawResponse();

    // body is a `string`
    t.is(body.content, transformedText);

    // rawBody is a `Buffer` with the uncompressed bytes of the response
    t.true(originalBytes.equals(body.rawContent), 'rawContent is not the same');

    // rawBodyResponse is a `Buffer` with the original bytes of the response
    t.true(content.equals(rawResponse));

    await server.stop();
};

supportedEncodings.forEach((encoding) => {
    contentTypes.forEach((contentType) => {
        test(`requester handles ${encoding} uncompressed for content type ${contentType}`, testTextDecoding, encoding, contentType);
        test(`requester handles ${encoding} compressed with gzip for content type ${contentType}`, testTextDecoding, encoding, contentType, 'gzip');
        test(`requester handles ${encoding} compressed with brotli for content type ${contentType}`, testTextDecoding, encoding, contentType, 'br');
    });
});

/*
 * ------------------------------------------------------------------------------
 * Binary Content-Types
 * ------------------------------------------------------------------------------
 */

const binTypes = [
    'image/jpeg',
    'image/png'
];

/** This function verifies that no decoding is done if `Content-Type` doesn't expect it. */
const testBinaries = async (t: ExecutionContext<RequesterContext>, binType: string) => {
    const { requester } = t.context;

    const content = iconv.encode(text, 'iso-8859-1');

    const server = await Server.create({
        configuration: {
            '/': {
                content,
                headers: { 'Content-Type': `${binType}; charset=iso-8859-1` }
            }
        }
    });

    const { response: { body } } = await requester.get(`http://localhost:${server.port}`);

    t.deepEqual(body.rawContent, content);

    // Body should be null
    t.is(body.content, null);

    await server.stop();
};

binTypes.forEach((binType) => {
    test(`requester doesn't transform content for ${binType}`, testBinaries, binType);
});

/*
 * ------------------------------------------------------------------------------
 * Hops
 * ------------------------------------------------------------------------------
 */

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

const loopServerConfig = {
    '/hop301': {
        content: 'hop301',
        status: 301
    }
};

const loopServerMultiSteps = {
    '/hop301': {
        content: 'hop302',
        status: 301
    },
    '/hop302': {
        content: 'hop303',
        status: 302
    },
    '/hop303': {
        content: 'hop301',
        status: 303
    }
};

test(`Requester follows all hops, reports the right number and returns the final string content`, async (t) => {
    const { requester } = t.context;

    const server = await Server.create({ configuration: hopsServerConfig });

    const { response } = await requester.get(`http://localhost:${server.port}/hop301`) as NetworkData;

    t.is(response.hops.length, Object.keys(hopsServerConfig).length - 1);
    t.is(response.body.content, hopsServerConfig['/']);

    await server.stop();
});

test(`Throws an error if number of hops exceeds the redirect limit`, async (t) => {
    const maxRedirectsRequester = new Requester({ maxRedirects: 4 });
    const server = await Server.create({ configuration: hopsServerConfig });

    t.plan(1);

    try {
        await maxRedirectsRequester.get(`http://localhost:${server.port}/hop301`);
    } catch (e) {
        t.is(e, 'The number of redirects(5) exceeds the limit(4).');
    }

    await server.stop();
});

test(`Aborts the request if it exceeds the time limit to get response`, async (t) => {
    const timeoutRequester = new Requester({ timeout: 3000 });
    const timeOutServerConfig = { '/timeout': { content: 'timeout' } };

    const server = await Server.create({ configuration: timeOutServerConfig });

    t.plan(2);

    try {
        await timeoutRequester.get(`http://localhost:${server.port}/timeout`);
    } catch (e) {
        t.is(e.error.code, 'ESOCKETTIMEDOUT');
        t.is(e.uri, `http://localhost:${server.port}/timeout`);
    }

    await server.stop();
});

test(`Requester returns and exception if a loop is detected`, async (t) => {
    const { requester } = t.context;

    const server = await Server.create({ configuration: loopServerConfig });

    t.plan(1);

    try {
        await requester.get(`http://localhost:${server.port}/hop301`) as NetworkData; // eslint-disable-line no-unused-expressions
    } catch (e) {
        t.is(e, `'http://localhost:${server.port}/hop301' could not be fetched using GET method (redirect loop detected).`);
    }

    await server.stop();
});

test(`Requester returns and exception if a loop is detected after few redirects`, async (t) => {
    const { requester } = t.context;

    const server = await Server.create({ configuration: loopServerMultiSteps });

    t.plan(1);

    try {
        await requester.get(`http://localhost:${server.port}/hop301`) as NetworkData; // eslint-disable-line no-unused-expressions
    } catch (e) {
        t.is(e, `'http://localhost:${server.port}/hop303' could not be fetched using GET method (redirect loop detected).`);
    }

    await server.stop();
});
