import * as url from 'url';

import test from 'ava';

import { builders } from '../../helpers/connectors';

import { IConnector, IConnectorBuilder } from '../../../src/lib/types';

test.beforeEach((t) => {
    const sonarwhal = {
        emit() { },
        emitAsync() { }
    };

    t.context = { sonarwhal };
});

test.afterEach.always(async (t) => {
    await t.context.connector.close();
});

const testConnectorInvalidUrl = (connectorInfo) => {
    const connectorBuilder: IConnectorBuilder = connectorInfo.builder;
    const name: string = connectorInfo.name;

    test(`[${name}] Load an invalid url throws an error`, async (t) => {
        const { sonarwhal } = t.context;
        const connector: IConnector = await (connectorBuilder)(sonarwhal, {});

        t.context.connector = connector;

        await t.throws(connector.collect(url.parse('https://localhome')));
    });
};

builders.forEach((connector) => {
    testConnectorInvalidUrl(connector);
});
