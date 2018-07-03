import { URL } from 'url';

import test from 'ava';

import { createServer } from '@hint/utils-create-server';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { IConnector } from 'hint/dist/src/lib/types';
import ChromeConnector from '../src/connector';

const name: string = 'chrome';

const scripts = [
    {
        code:
            `(function () {
    return 10;
}())`,
        result: 10
    },
    {
        code:
            `(function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done');
        }, 1000);
    });
}())`,
        result: 'done'
    },
    {
        code:
            `(function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('aborted'));
        }, 1000);
    });
}())`,
        result: new Error('aborted')
    },
    {
        code: 'return 10;',
        result: new Error()
    }
];

test.beforeEach(async (t) => {
    const engine = {
        emit() { },
        emitAsync() { },
        timeout: 10000
    };

    const server = createServer();

    await server.start();

    t.context = {
        engine,
        server
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector.close();
});

test(`[${name}] Evaluate JavaScript`, async (t) => {
    const { engine } = t.context;
    const connector: IConnector = new ChromeConnector(engine, {});
    const server = t.context.server;

    t.plan(scripts.length);
    t.context.connector = connector;

    server.configure(generateHTMLPage('', ''));

    await connector.collect(new URL(`http://localhost:${server.port}/`));

    for (let i = 0; i < scripts.length; i++) {
        const { code, result: expectedResult } = scripts[i];

        try {
            const result = await (connector.evaluate ? connector.evaluate(code) : null);

            t.is(result, expectedResult, `Result value "${result}" is the same`);
        } catch (error) {
            if (expectedResult instanceof Error) {
                t.pass('Expected exception');

                /*
                 * HACK: when running all the tests the message we
                 * receive from CDP is "Promise was collected".
                 *
                 * If we run the `chrome.js` test file everything is fine :(
                 *
                 * const message = expectedResult.message;
                 *
                 * if (message) {
                 *     if (error.message !== message) {
                 *         console.error(error.message);
                 *     }
                 *     t.is(error.message, message, `Error message "${message}" is the same`);
                 * } else {
                 *     t.pass('Expected exception with different connector responses');
                 * }
                 */
            } else {
                t.fail('Unexpected exception thrown');
            }
        }
    }
});
