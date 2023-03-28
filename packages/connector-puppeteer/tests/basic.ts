/* eslint-disable no-sync */

import { URL } from 'url';

import * as sinon from 'sinon';
import anyTest, { TestFn, ExecutionContext } from 'ava';

import { generateHTMLPage, Server, ServerConfiguration } from '@hint/utils-create-server';
import { Engine, Events, IConnector, IConnectorConstructor } from 'hint';

import Connector from '../src/connector';

const name = 'puppeteer';

type Context = {
    engine: Engine<Events>;
    engineEmitSpy: sinon.SinonSpy<any, boolean>;
    engineEmitAsyncSpy: sinon.SinonSpy<any, any>;
};

const test = anyTest as TestFn<Context>;

test.beforeEach((t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        on(): Engine {
            return null as any;
        }
    } as any;

    t.context.engineEmitSpy = sinon.spy(engine, 'emit');
    t.context.engineEmitAsyncSpy = sinon.spy(engine, 'emitAsync');

    t.context.engine = engine;
});

test.afterEach.always((t) => {
    t.context.engineEmitSpy.restore();
    t.context.engineEmitAsyncSpy.restore();
});

const validateTest = async (t: ExecutionContext<Context>, Connector: IConnectorConstructor, serverConfig: ServerConfiguration, validateFunction: (connector: IConnector) => void) => {
    const server = await Server.create({ configuration: serverConfig });
    const { engine } = t.context;
    const connector = new Connector(engine, { detached: true });

    await connector.collect(new URL(`http://localhost:${server.port}/`));
    validateFunction(connector);
    await Promise.all([connector.close(), server.stop()]);

    return server;
};

test(`[${name}] Connector dom getter is returning a value`, async (t) => {
    const serverConfig: ServerConfiguration = { '/': generateHTMLPage(`<title>Test</title>`) };

    const functionToValidate = (connector: IConnector) => {
        t.not(connector.dom, undefined);
    };

    await validateTest(t, Connector, serverConfig, functionToValidate);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::html').callCount, 1);
});

test(`[${name}] Connector html getter is returning a value`, async (t) => {
    const serverConfig: ServerConfiguration = { '/': generateHTMLPage(`<title>Test</title>`) };

    const functionToValidate = (connector: IConnector) => {
        t.not(connector.html, undefined);
    };

    await validateTest(t, Connector, serverConfig, functionToValidate);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::html').callCount, 1);
});
