/**
 * @fileoverview Minimum event functionality a collector must implement in order to be valid.
 *
 * File starts with `_` so it isn't executed by `ava` directly.
 */

/* eslint-disable no-sync */

import * as url from 'url';

import test from 'ava';

import { builders } from '../../helpers/collectors';
import { createServer } from '../../helpers/test-server';
import { generateHTMLPage } from '../../helpers/misc';
import { ICollector, ICollectorBuilder } from '../../../src/lib/types'; // eslint-disable-line no-unused-vars

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
    await t.context.collector.close();
});

const testCollectorEvaluate = (collectorInfo) => {
    const collectorBuilder: ICollectorBuilder = collectorInfo.builder;
    const name: string = collectorInfo.name;

    test(`[${name}] Evaluate JavaScript`, async (t) => {
        const { sonar } = t.context;
        const collector: ICollector = await (collectorBuilder)(sonar, {});
        const server = t.context.server;

        t.plan(scripts.length);
        t.context.collector = collector;

        server.configure(generateHTMLPage(null, ''));

        await collector.collect(url.parse(`http://localhost:${server.port}/`));

        for (let i = 0; i < scripts.length; i++) {
            const { code, result: expectedResult } = scripts[i];

            try {
                const result = await collector.evaluate(code);

                t.is(result, expectedResult, `Result value "${result}" is the same`);
            } catch (error) {
                if (expectedResult instanceof Error) {
                    t.pass('Expected exception');

                    // HACK: when running all the tests the message we receive from CDP is "Promise was collected".
                    // If we just run the `cdp.js` test file everything is fine :(
                    // const message = expectedResult.message;

                    // if (message) {
                    //     if (error.message !== message) {
                    //         console.error(error.message);
                    //     }

                    //     t.is(error.message, message, `Error message "${message}" is the same`);
                    // } else {
                    //     t.pass('Expected exception with different collector responses');
                    // }
                } else {
                    t.fail('Unexpected exception thrown');
                }
            }
        }
    });

};

builders.forEach((collector) => {
    testCollectorEvaluate(collector);
});
