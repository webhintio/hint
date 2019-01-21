import { URL } from 'url';

import test from 'ava';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import ChromeConnector from '../src/connector';

const name: string = 'chrome';

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    const connector: IConnector = new ChromeConnector(engine, {});

    await t.throwsAsync(connector.collect(new URL('https://localhome')));

    await connector.close();
});
