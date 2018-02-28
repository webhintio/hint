/*
 * This interface needs to be imported in order
 * to generate the definition of this file.
 */
import { IConnectorConstructor } from '../../src/lib/types'; // eslint-disable-line no-unused-vars

import ChromeConnector from '../../src/lib/connectors/chrome/chrome';
import JSDOMConnector from '../../src/lib/connectors/jsdom/jsdom';

/** The IDs of the available connectors to test. */
export const ids = [
    'chrome',
    'jsdom'
];

/** The Constructors of the available connectors to test. */
export const connectors: Array<{ctor: IConnectorConstructor, name: string}> = [
    {
        ctor: ChromeConnector,
        name: 'chrome'
    },
    {
        ctor: JSDOMConnector,
        name: 'jsdom'
    }
];
