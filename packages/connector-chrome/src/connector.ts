/**
 * @fileoverview Connector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Connector } from '@hint/utils-debugging-protocol-common';
import { Engine, ILauncher } from 'hint';

import { CDPLauncher } from './chrome-launcher';


export default class ChromeConnector extends Connector {
    public static schema = {
        additionalProperties: false,
        properties: {
            ignoreHTTPSErrors: { type: 'boolean' },
            launcherOptions: { type: 'object' },
            waitFor: {
                minimum: 0,
                type: 'number'
            }
        }
    };

    public constructor(server: Engine, config?: any) {
        const launcher: ILauncher = new CDPLauncher(config && config.launcherOptions|| {});

        super(server, config || {}, launcher);
    }
}
