import { URL } from 'url';

import test from 'ava';

import { Engine, Events, IConnector } from 'hint';

import Connector from '../src/connector';

const name: string = 'chromium';

test(`[${name}] Load an invalid url throws an error`, async (t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        on(): Engine {
            return null as any;
        }
    } as any;

    const connector: IConnector = new Connector(engine, { detached: true });

    // Target doesn't exist
    await t.throwsAsync(connector.collect(new URL('https://localhome')));

    // Target is not http(s)
    await t.throwsAsync(connector.collect(new URL('file://bla')));

    await connector.close();
});
