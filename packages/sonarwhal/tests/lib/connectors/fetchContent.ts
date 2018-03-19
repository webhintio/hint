/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import test from 'ava';

import { connectors } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { IConnector, NetworkData, IConnectorConstructor } from '../../../src/lib/types';

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

const testConnectorFetchContent = (connectorInfo) => {
    const ConnectorConstructor: IConnectorConstructor = connectorInfo.ctor;
    const name: string = connectorInfo.name;

    test(`[${name}] Fetch Content`, async (t) => {
        const file = fs.readFileSync(path.join(__dirname, './fixtures/common/nellie.png'));
        const { sonarwhal } = t.context;
        const connector: IConnector = new ConnectorConstructor(sonarwhal, {});
        const server = t.context.server;

        t.context.connector = connector;

        server.configure({ '/nellie.png': { content: file } });

        const result: NetworkData = await connector.fetchContent(new URL(`http://localhost:${server.port}/nellie.png`));
        const rawResponse = await result.response.body.rawResponse();

        t.is(result.response.statusCode, 200);
        t.true(file.equals(result.response.body.rawContent), 'rawContent is the same');
        // Because it is an image and it is not send compressed, the rawResponse should be the same
        t.true(file.equals(rawResponse), 'rawResponse is the same');
    });

};

connectors.forEach((connector) => {
    testConnectorFetchContent(connector);
});
