/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { Server, ServerConfiguration } from '@hint/utils-create-server';
import { Engine, Events, IConnectorConstructor } from 'hint';
import { test as testUtils } from '@hint/utils';

import ChromeConnector from '../src/connector';

const { generateHTMLPage } = testUtils;

const name = 'puppeteer';

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

const pathToFaviconInDir = path.join(__dirname, './fixtures/common/favicon.ico');
const pathToFaviconInLinkElement = path.join(__dirname, './fixtures/common/favicon-32x32.png');

const runTest = async (t: ExecutionContext<CollectContext>, Connector: IConnectorConstructor, serverConfig: ServerConfiguration): Promise<Server> => {
    const server = await Server.create({ configuration: serverConfig });
    const { engine } = t.context;
    const connector = new Connector(engine, { detached: true });

    await connector.collect(new URL(`http://localhost:${server.port}/`));
    await Promise.all([connector.close(), server.stop()]);

    return server;
};

test(`[${name}] The HTML is downloaded and the right event emitted`, async (t) => {
    const serverConfig: ServerConfiguration = { '/': generateHTMLPage(`<title>Test</title>`) };

    await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::html').callCount, 1);
});

test(`[${name}] Favicon is present in a 'link' element with 'rel' attribute set to 'icon' `, async (t) => {
    const faviconInLinkElementDir = `http://localhost/images/favicon-32x32.png`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
        '/images/favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
    };

    const server = await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInLinkElementDir, server.port));

});

test(`[${name}] Favicon is present in the root directory`, async (t) => {
    const faviconInRootDir = `http://localhost/favicon.ico`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(),
        '/favicon.ico': fs.readFileSync(pathToFaviconInDir)
    };

    const server = await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInRootDir, server.port));
});

test(`[${name}] Favicon is present in both the root directory and the 'link' element`, async (t) => {
    const faviconInLinkElementDir = `http://localhost/images/favicon-32x32.png`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
        '/favicon.ico': fs.readFileSync(pathToFaviconInDir),
        '/images/favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
    };

    const server = await runTest(t, ChromeConnector, serverConfig);

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

    const server = await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    // Should load favicon from the root even though the link element exists because 'href' is empty.
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInRootDir, server.port));
});

test(`[${name}] Favicon is not present in either the root directory or the 'link' element`, async (t) => {
    const faviconInRootDir = `http://localhost/favicon.ico`;
    const serverConfig: ServerConfiguration = { '/': generateHTMLPage() };

    const server = await runTest(t, ChromeConnector, serverConfig);

    // Requests to `/favicon.ico` are always sent when favicon doesn't exist as a `link` tag in the html.
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engineEmitAsyncSpy.withArgs('fetch::end::image').args[0][1].request.url, Server.updateLocalhost(faviconInRootDir, server.port));
});
