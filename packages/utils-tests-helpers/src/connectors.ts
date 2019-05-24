/*
 * This interface needs to be imported in order
 * to generate the definition of this file.
 */
import { IConnectorConstructor } from 'hint';

import PuppeteerConnector from '@hint/connector-puppeteer';
import JSDOMConnector from '@hint/connector-jsdom';

/** The IDs of the available connectors to test. */
const ids = [
    'puppeteer',
    'jsdom'
];

/** The Constructors of the available connectors to test. */
const connectors: { ctor: IConnectorConstructor; name: string }[] = [
    {
        ctor: PuppeteerConnector,
        name: 'puppeteer'
    },
    {
        ctor: JSDOMConnector,
        name: 'jsdom'
    }
];

export {
    connectors,
    ids
};
