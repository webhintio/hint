import { URL } from 'url';

import anyTest, { TestInterface } from 'ava';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import ChromeConnector from '../src/connector';

type InvalidUrlContext = {
    engine: Engine<Events>;
    connector?: IConnector;
};

const test = anyTest as TestInterface<InvalidUrlContext>;

const name: string = 'chrome';

test.beforeEach((t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    t.context = { engine };
});

test.afterEach.always(async (t) => {
    await t.context.connector!.close();
});

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const { engine } = t.context;
    const connector: IConnector = new ChromeConnector(engine, {});

    t.context.connector = connector;

    await t.throwsAsync(connector.collect(new URL('https://localhome')));
});
