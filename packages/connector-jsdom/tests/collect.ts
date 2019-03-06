/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { ServerConfiguration, Server } from '@hint/utils-create-server';
import { IConnector, IConnectorConstructor, Events } from 'hint/dist/src/lib/types';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

const name: string = 'jsdom';

type CollectContext = {
    engine: Engine<Events>;
    engineEmitSpy: sinon.SinonSpy<any, boolean>;
    engineEmitAsyncSpy: sinon.SinonSpy<any, any>;
};

const test = anyTest as TestInterface<CollectContext>;

test.beforeEach((t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { }
    } as any;

    t.context.engineEmitSpy = sinon.spy(engine, 'emit');
    t.context.engineEmitAsyncSpy = sinon.spy(engine, 'emitAsync');
    t.context.engine = engine;
});

test.afterEach.always((t) => {
    t.context.engineEmitSpy.restore();
    t.context.engineEmitAsyncSpy.restore();
});

const pathToFaviconInDir = path.join(__dirname, './fixtures/common/favicon.ico');
const pathToFaviconInLinkElement = path.join(__dirname, './fixtures/common/favicon-32x32.png');

const runTest = async (t: ExecutionContext<CollectContext>, ConnectorConstructor: IConnectorConstructor, serverConfig?: ServerConfiguration): Promise<Server> => {
    const { engine } = t.context;
    const connector: IConnector = new ConnectorConstructor(engine, {});
    const server = await Server.create({ configuration: serverConfig });

    await connector.collect(new URL(`http://localhost:${server.port}/`));
    await Promise.all([connector.close(), server.stop()]);

    return server;
};

test(`[${name}] Favicon is present in a 'link' element with 'rel' attribute set to 'icon' `, async (t) => {
    const faviconInLinkElementDir = `http://localhost/images/favicon-32x32.png`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
        '/images/favicon-favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
    };

    const server = await runTest(t, JSDOMConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInLinkElementDir, server.port));

});

test(`[${name}] Favicon is present in the root directory`, async (t) => {
    const faviconInRootDir = `http://localhost/favicon.ico`;
    const serverConfig: ServerConfiguration = { '/favicon.ico': fs.readFileSync(pathToFaviconInDir) };

    const server = await runTest(t, JSDOMConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInRootDir, server.port));
});

test(`[${name}] Favicon is present in both the root directory and the 'link' element`, async (t) => {
    const faviconInLinkElementDir = `http://localhost/images/favicon-32x32.png`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
        '/favicon.ico': fs.readFileSync(pathToFaviconInDir),
        '/images/favicon-favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
    };

    const server = await runTest(t, JSDOMConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    // Should load favicon from the link element if it exists
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInLinkElementDir, server.port));
});

test(`[${name}] Favicon is present in both the root directory and the 'link' element, but the 'link' element has empty 'href'`, async (t) => {
    const faviconInRootDir = `http://localhost/favicon.ico`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="" sizes="32x32">`),
        '/favicon.ico': fs.readFileSync(pathToFaviconInDir)
    };

    const server = await runTest(t, JSDOMConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    // Should load favicon from the root even though the link element exists because 'href' is empty.
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInRootDir, server.port));
});

test(`[${name}] Favicon is not present in either the root directory or the 'link' element`, async (t) => {
    const faviconInRootDir = `http://localhost/favicon.ico`;

    const server = await runTest(t, JSDOMConnector);

    // Requests to `/favicon.ico` are always sent when favicon doesn't exist as a `link` tag in the html.
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInRootDir, server.port));
});
