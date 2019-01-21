import { URL } from 'url';

import test from 'ava';

import { Server } from '@hint/utils-create-server';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

const name: string = 'jsdom';

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

test(`[${name}] Evaluate JavaScript`, async (t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        timeout: 10000
    } as any;
    const connector: IConnector = new JSDOMConnector(engine, {});

    const server = await Server.create({ configuration: generateHTMLPage('', '') });

    t.plan(scripts.length);

    await connector.collect(new URL(`http://localhost:${server.port}/`));

    for (let i = 0; i < scripts.length; i++) {
        const { code, result: expectedResult } = scripts[i];

        try {
            const result = await (connector.evaluate ? connector.evaluate(code) : null);

            t.is(result, expectedResult, `Result value "${result}" is the same`);
        } catch (error) {
            if (expectedResult instanceof Error) {
                t.pass('Expected exception');
            } else {
                t.fail('Unexpected exception thrown');
            }
        }
    }

    await Promise.all([connector.close(), server.stop()]);
});
