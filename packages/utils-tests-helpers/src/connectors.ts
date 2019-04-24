/*
 * This interface needs to be imported in order
 * to generate the definition of this file.
 */
import { IConnectorConstructor } from 'hint';

import ChromiumConnector from '@hint/connector-chromium';
import JSDOMConnector from '@hint/connector-jsdom';

/** The IDs of the available connectors to test. */
export const ids = [
    'chromium',
    'jsdom'
];

/** The Constructors of the available connectors to test. */
export const connectors: { ctor: IConnectorConstructor; name: string }[] = [
    {
        ctor: ChromiumConnector,
        name: 'chromium'
    },
    {
        ctor: JSDOMConnector,
        name: 'jsdom'
    }
];
