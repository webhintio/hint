/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import * as sinon from 'sinon';

import test from 'ava';

import { connectors } from '../../helpers/connectors';
import { createServer } from '../../helpers/test-server';
import { IConnector, IConnectorConstructor } from '../../../src/lib/types';
import { generateHTMLPage } from '../../helpers/misc';

test.beforeEach(async (t) => {
    const sonarwhal = {
        emit() { },
        emitAsync() { }
    };

    const server = createServer();

    await server.start();

    sinon.spy(sonarwhal, 'emit');
    sinon.spy(sonarwhal, 'emitAsync');

    t.context = {
        server,
        sonarwhal
    };
});

test.afterEach.always((t) => {
    t.context.server.stop();
    t.context.sonarwhal.emit.restore();
    t.context.sonarwhal.emitAsync.restore();
});

const pathToFaviconInDir = path.join(__dirname, './fixtures/common/favicon.ico');
const pathToFaviconInLinkElement = path.join(__dirname, './fixtures/common/favicon-32x32.png');

const runTest = async (t, ConnectorConstructor: IConnectorConstructor, serverConfig?) => {
    const { sonarwhal } = t.context;
    const connector: IConnector = new ConnectorConstructor(sonarwhal, {});
    const server = t.context.server;

    if (serverConfig) {
        server.configure(serverConfig);
    }

    await connector.collect(new URL(`http://localhost:${server.port}/`));
    await connector.close();
};

const testConnectorCollect = (connectorInfo) => {
    const ConnectorConstructor: IConnectorConstructor = connectorInfo.ctor;
    const name: string = connectorInfo.name;

    test(`[${name}] Favicon is present in a 'link' element with 'rel' attribute set to 'icon' `, async (t) => {
        const faviconInLinkElementDir = `http://localhost:${t.context.server.port}/images/favicon-32x32.png`;
        const serverConfig = {
            '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
            '/images/favicon-favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
        };

        await runTest(t, ConnectorConstructor, serverConfig);

        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').callCount, 1);
        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInLinkElementDir);

    });

    test(`[${name}] Favicon is present in the root directory`, async (t) => {
        const faviconInRootDir = `http://localhost:${t.context.server.port}/favicon.ico`;
        const serverConfig = { '/favicon.ico': fs.readFileSync(pathToFaviconInDir) };

        await runTest(t, ConnectorConstructor, serverConfig);

        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').callCount, 1);
        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInRootDir);
    });

    test(`[${name}] Favicon is present in both the root directory and the 'link' element`, async (t) => {
        const faviconInLinkElementDir = `http://localhost:${t.context.server.port}/images/favicon-32x32.png`;
        const serverConfig = {
            '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
            '/favicon.ico': fs.readFileSync(pathToFaviconInDir),
            '/images/favicon-favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
        };

        await runTest(t, ConnectorConstructor, serverConfig);

        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').callCount, 1);
        // Should load favicon from the link element if it exists
        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInLinkElementDir);
    });

    test(`[${name}] Favicon is present in both the root directory and the 'link' element, but the 'link' element has empty 'href'`, async (t) => {
        const faviconInRootDir = `http://localhost:${t.context.server.port}/favicon.ico`;
        const serverConfig = {
            '/': generateHTMLPage(`<link rel="icon" type="image/png" href="" sizes="32x32">`),
            '/favicon.ico': fs.readFileSync(pathToFaviconInDir)
        };

        await runTest(t, ConnectorConstructor, serverConfig);

        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').callCount, 1);
        // Should load favicon from the root even though the link element exists because 'href' is empty.
        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInRootDir);
    });

    test(`[${name}] Favicon is not present in either the root directory or the 'link' element`, async (t) => {
        const faviconInRootDir = `http://localhost:${t.context.server.port}/favicon.ico`;

        await runTest(t, ConnectorConstructor);

        // Requests to `/favicon.ico` are always sent when favicon doesn't exist as a `link` tag in the html.
        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').callCount, 1);
        t.is(t.context.sonarwhal.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInRootDir);
    });
};

connectors.forEach((connector) => {
    testConnectorCollect(connector);
});
