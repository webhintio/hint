import * as url from 'url';

import test from 'ava';

import { connectors } from '../../helpers/connectors';

import { IConnector, IConnectorConstructor } from '../../../src/lib/types';

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
    const ConnectorConstructor: IConnectorConstructor = connectorInfo.ctor;
    const name: string = connectorInfo.name;

    test(`[${name}] Load an invalid url throws an error`, async (t) => {
        const { sonarwhal } = t.context;
        const connector: IConnector = new ConnectorConstructor(sonarwhal, {});

        t.context.connector = connector;

        await t.throws(connector.collect(url.parse('https://localhome')));
    });
};

connectors.forEach((connector) => {
    testConnectorInvalidUrl(connector);
});
