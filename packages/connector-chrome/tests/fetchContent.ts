/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import test from 'ava';

import { createServer } from '@sonarwhal/utils-create-server';
import { IConnector, NetworkData } from 'sonarwhal/dist/src/lib/types';
import ChromeConnector from '../src/connector';

const name: string = 'chrome';

test.beforeEach(async (t) => {
    const sonarwhal = {
        emit() { },
        emitAsync() { }
    };

    const server = createServer();

    await server.start();

    t.context = {
        server,
        sonarwhal
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector.close();
});

test(`[${name}] Fetch Content`, async (t) => {
    const file = fs.readFileSync(path.join(__dirname, './fixtures/common/nellie.png'));
    const { sonarwhal } = t.context;
    const connector: IConnector = new ChromeConnector(sonarwhal, {});
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
