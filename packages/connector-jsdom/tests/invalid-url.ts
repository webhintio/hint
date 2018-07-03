import { URL } from 'url';

import test from 'ava';

import { IConnector } from 'hint/dist/src/lib/types';
import JSDOMConnector from '../src/connector';

const name: string = 'jsdom';

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
    const connector: IConnector = new JSDOMConnector(engine, {});

    t.context.connector = connector;

    await t.throws(connector.collect(new URL('https://localhome')));
});
