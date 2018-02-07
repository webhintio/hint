/*
 * This interface needs to be imported in order
 * to generate the definition of this file.
 */
import { IConnectorBuilder } from '../../src/lib/types'; // eslint-disable-line no-unused-vars

import chromeBuilder from '../../src/lib/connectors/chrome/chrome';
import jsdomBuilder from '../../src/lib/connectors/jsdom/jsdom';

/** The IDs of the available connectors to test. */
export const ids = [
    'chrome',
    'jsdom'
];

/** The builders of the available connectors to test. */
export const builders: Array<{builder: IConnectorBuilder, name: string}> = [
    {
        builder: chromeBuilder,
        name: 'chrome'
    },
    {
        builder: jsdomBuilder,
        name: 'jsdom'
    }
];
