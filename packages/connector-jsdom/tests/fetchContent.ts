/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import anyTest, { TestInterface } from 'ava';
import { createServer, Server } from '@hint/utils-create-server';
import { IConnector, NetworkData, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

type FetchContentContext = {
    connector?: IConnector;
    engine: Engine<Events>;
    server: Server;
};

const test = anyTest as TestInterface<FetchContentContext>;

const name: string = 'jsdom';

test.beforeEach(async (t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    const server = createServer();

    await server.start();

    t.context = {
        engine,
        server
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector!.close();
});

test(`[${name}] Fetch Content`, async (t) => {
    const file = fs.readFileSync(path.join(__dirname, './fixtures/common/nellie.png'));
    const { engine } = t.context;
    const connector: IConnector = new JSDOMConnector(engine, {});
    const server = t.context.server;

    t.context.connector = connector;

    server.configure({ '/nellie.png': { content: file } });

    const result: NetworkData = await (connector.fetchContent ? connector.fetchContent(new URL(`http://localhost:${server.port}/nellie.png`)) : {} as NetworkData);
    const rawResponse = await result.response.body.rawResponse();

    t.is(result.response.statusCode, 200);
    t.true(file.equals(result.response.body.rawContent), 'rawContent is the same');
    // Because it is an image and it is not send compressed, the rawResponse should be the same
    t.true(file.equals(rawResponse), 'rawResponse is the same');
});
