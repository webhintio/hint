import * as isCI from 'is-ci';

/*
 * This interface needs to be imported in order
 * to generate the definition of this file.
 */
import { IConnectorConstructor } from 'hint';

import PuppeteerConnector from '@hint/connector-puppeteer';
import JSDOMConnector from '@hint/connector-jsdom';

/** The IDs of the available connectors to test. */
const ids = [
    'jsdom'
];

/** The Constructors of the available connectors to test. */
const connectors: { ctor: IConnectorConstructor; name: string }[] = [
    {
        ctor: JSDOMConnector,
        name: 'jsdom'
    }
];

/**
 * Azure Pipelines has an old version of Chrome that does not
 * work with puppeteer correctly. This is needed to ignore
 * the connector until they update.
 */
if (!(isCI && process.platform === 'win32')) {
    /**
     * Need to `unshift` instead of `push` because otherwise some
     * tests with `jsdom` could time out (i.e.: `no-disallowed-headers`)
     */
    ids.unshift('puppeteer');
    connectors.unshift({
        ctor: PuppeteerConnector,
        name: 'puppeteer'
    });
}

export {
    connectors,
    ids
};
