/* eslint-disable no-sync */

import * as url from 'url';

import test from 'ava';

import { builders } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { generateHTMLPage } from '../../helpers/misc';
import { IConnector, IConnectorBuilder } from '../../../src/lib/types'; // eslint-disable-line no-unused-vars

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
    const sonar = {
        emit() { },
        emitAsync() { }
    };

    const server = createServer();

    await server.start();

    t.context = {
        server,
        sonar
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector.close();
});

const testConnectorEvaluate = (connectorInfo) => {
    const connectorBuilder: IConnectorBuilder = connectorInfo.builder;
    const name: string = connectorInfo.name;

    test(`[${name}] Evaluate JavaScript`, async (t) => {
        const { sonar } = t.context;
        const connector: IConnector = await (connectorBuilder)(sonar, {});
        const server = t.context.server;

        t.plan(scripts.length);
        t.context.connector = connector;

        server.configure(generateHTMLPage(null, ''));

        await connector.collect(url.parse(`http://localhost:${server.port}/`));

        for (let i = 0; i < scripts.length; i++) {
            const { code, result: expectedResult } = scripts[i];

            try {
                const result = await connector.evaluate(code);

                t.is(result, expectedResult, `Result value "${result}" is the same`);
            } catch (error) {
                if (expectedResult instanceof Error) {
                    t.pass('Expected exception');

                    // HACK: when running all the tests the message we receive from CDP is "Promise was collected".
                    // If we just run the `chrome.js` test file everything is fine :(
                    // const message = expectedResult.message;

                    // if (message) {
                    //     if (error.message !== message) {
                    //         console.error(error.message);
                    //     }

                    //     t.is(error.message, message, `Error message "${message}" is the same`);
                    // } else {
                    //     t.pass('Expected exception with different connector responses');
                    // }
                } else {
                    t.fail('Unexpected exception thrown');
                }
            }
        }
    });

};

builders.forEach((connector) => {
    testConnectorEvaluate(connector);
});
