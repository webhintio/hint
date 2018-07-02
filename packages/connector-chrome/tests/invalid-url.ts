import { URL } from 'url';

import test from 'ava';

import ChromeConnector from '../src/connector';
import { IConnector } from 'hint/dist/src/lib/types';

const name: string = 'chrome';

test.beforeEach((t) => {
    const engine = {
        emit() { },
        emitAsync() { }
    };

    t.context = { engine };
});

test.afterEach.always(async (t) => {
    await t.context.connector.close();
});

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const { engine } = t.context;
    const connector: IConnector = new ChromeConnector(engine, {});

    t.context.connector = connector;

    await t.throws(connector.collect(new URL('https://localhome')));
});
