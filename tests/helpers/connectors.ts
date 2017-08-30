// We need to import this interface to generate the definition of this file
import { IConnectorBuilder } from '../../src/lib/types'; // eslint-disable-line no-unused-vars

import chromeBuilder from '../../src/lib/connectors/chrome/chrome';
import jsdomBuilder from '../../src/lib/connectors/jsdom/jsdom';

/** The ids of the available connectors to test. */
export const ids = ['jsdom', 'chrome'];

/** The builders of the available connectors to test. */
export const builders = [
    {
        builder: chromeBuilder,
        name: 'chrome'
    },
    {
        builder: jsdomBuilder,
        name: 'jsdom'
    }
];
