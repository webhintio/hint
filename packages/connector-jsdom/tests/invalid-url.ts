import { URL } from 'url';

import test from 'ava';

import { IConnector } from 'sonarwhal/dist/src/lib/types';
import JSDOMConnector from '../src/jsdom';

test.beforeEach((t) => {
    const sonarwhal = {
        emit() { },
        emitAsync() { }
    };

    t.context = { sonarwhal };
});

test.afterEach.always(async (t) => {
    await t.context.connector.close();
});

const name: string = 'jsdom';

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const { sonarwhal } = t.context;
    const connector: IConnector = new JSDOMConnector(sonarwhal, {});

    t.context.connector = connector;

    await t.throws(connector.collect(new URL('https://localhome')));
});
