import { URL } from 'url';

import test from 'ava';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

const name: string = 'jsdom';

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    const connector: IConnector = new JSDOMConnector(engine, {});

    t.plan(1);

    try {
        await connector.collect(new URL('https://localhome'));
    } catch (e) {
        t.true(true);
    }

    await connector.close();
});
