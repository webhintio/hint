import { URL } from 'url';

import test from 'ava';

import ChromeConnector from '../src/chrome';
import { IConnector } from 'sonarwhal/dist/src/lib/types';

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

const name: string = 'chrome';

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const { sonarwhal } = t.context;
    const connector: IConnector = new ChromeConnector(sonarwhal, {});

    t.context.connector = connector;

    await t.throws(connector.collect(new URL('https://localhome')));
});
