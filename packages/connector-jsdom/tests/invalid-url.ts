import { URL } from 'url';

import anyTest, { TestInterface } from 'ava';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

type InvalidUrlContext = {
    engine: Engine<Events>;
    connector: IConnector;
};

const test = anyTest as TestInterface<InvalidUrlContext>;

const name: string = 'jsdom';

test.beforeEach((t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    t.context.engine = engine;
});

test.afterEach.always(async (t) => {
    await t.context.connector.close();
});

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const { engine } = t.context;
    const connector: IConnector = new JSDOMConnector(engine, {});

    t.context.connector = connector;

    t.plan(1);

    try {
        await connector.collect(new URL('https://localhome'));
    } catch (e) {
        t.true(true);
    }
});
