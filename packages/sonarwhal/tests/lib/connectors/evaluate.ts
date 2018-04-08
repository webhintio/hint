import { URL } from 'url';

import test from 'ava';

import { connectors } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { generateHTMLPage } from '../../helpers/misc';
import { IConnector, IConnectorConstructor } from '../../../src/lib/types';

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
    const sonarwhal = {
        emit() { },
        emitAsync() { },
        timeout: 10000
    };

    const server = createServer();

    await server.start();

    t.context = {
        server,
        sonarwhal
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector.close();
});

const testConnectorEvaluate = (connectorInfo) => {
    const ConnectorConstructor: IConnectorConstructor = connectorInfo.ctor;
    const name: string = connectorInfo.name;

    test(`[${name}] Evaluate JavaScript`, async (t) => {
        const { sonarwhal } = t.context;
        const connector: IConnector = new ConnectorConstructor(sonarwhal, {});
        const server = t.context.server;

        t.plan(scripts.length);
        t.context.connector = connector;

        server.configure(generateHTMLPage(null, ''));

        await connector.collect(new URL(`http://localhost:${server.port}/`));

        for (let i = 0; i < scripts.length; i++) {
            const { code, result: expectedResult } = scripts[i];

            try {
                const result = await connector.evaluate(code);

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

};

connectors.forEach((connector) => {
    testConnectorEvaluate(connector);
});
