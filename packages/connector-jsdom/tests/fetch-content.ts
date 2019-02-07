/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import test from 'ava';
import { Server } from '@hint/utils-create-server';
import { IConnector, NetworkData, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

const name: string = 'jsdom';

test(`[${name}] Fetch Content`, async (t) => {
    const file = fs.readFileSync(path.join(__dirname, './fixtures/common/nellie.png'));
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    const connector: IConnector = new JSDOMConnector(engine, {});
    const server = await Server.create({ configuration: { '/nellie.png': { content: file } } });

    const result: NetworkData = await (connector.fetchContent ? connector.fetchContent(new URL(`http://localhost:${server.port}/nellie.png`)) : {} as NetworkData);
    const rawResponse = await result.response.body.rawResponse();

    t.is(result.response.statusCode, 200);
    t.true(file.equals(result.response.body.rawContent), 'rawContent is the same');
    // Because it is an image and it is not send compressed, the rawResponse should be the same
    t.true(file.equals(rawResponse), 'rawResponse is the same');

    await Promise.all([connector.close(), server.stop()]);
});
