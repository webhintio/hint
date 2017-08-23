// We need to import this interface to generate the definition of this file
import { IConnectorBuilder } from '../../src/lib/types'; // eslint-disable-line no-unused-vars

import cdpBuilder from '../../src/lib/connectors/cdp/cdp';
import jsdomBuilder from '../../src/lib/connectors/jsdom/jsdom';

/** The ids of the available connectors to test. */
export const ids = ['jsdom', 'cdp'];

/** The builders of the available connectors to test. */
export const builders = [
    {
        builder: cdpBuilder,
        name: 'cdp'
    },
    {
        builder: jsdomBuilder,
        name: 'jsdom'
    }
];
