/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

import test from 'ava';

import { builders } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { IConnector, IConnectorBuilder, INetworkData } from '../../../src/lib/types';

test.beforeEach(async (t) => {
    const sonar = {
        emit() { },
        emitAsync() { }
    };

    const server = createServer();

    await server.start();

    t.context = {
        server,
        sonar
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector.close();
});

const testConnectorEvaluate = (connectorInfo) => {
    const connectorBuilder: IConnectorBuilder = connectorInfo.builder;
    const name: string = connectorInfo.name;

    test(`[${name}] Fetch Content`, async (t) => {
        const file = fs.readFileSync(path.join(__dirname, './fixtures/common/edge.png'));
        const { sonar } = t.context;
        const connector: IConnector = await (connectorBuilder)(sonar, {});
        const server = t.context.server;

        t.context.connector = connector;

        server.configure({ '/edge.png': { content: file } });

        const result: INetworkData = await connector.fetchContent(url.parse(`http://localhost:${server.port}/edge.png`));

        t.is(result.response.statusCode, 200);
        t.true(file.equals(result.response.body.rawContent), 'rawContent is the same');
        // Because it is an image, the rawResponse should be the same
        t.true(file.equals(result.response.body.rawResponse), 'rawResponse is the same');
    });

};

builders.forEach((connector) => {
    testConnectorEvaluate(connector);
});
