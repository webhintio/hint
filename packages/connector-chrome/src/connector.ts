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

import { Connector } from '@hint/utils-debugging-protocol-common/dist/src/debugging-protocol-connector';
import { ILauncher } from 'hint/dist/src/lib/types';
import { CDPLauncher } from './chrome-launcher';

import { Engine } from 'hint/dist/src/lib/engine';

export default class ChromeConnector extends Connector {
    public constructor(server: Engine, config?: object) {
        const launcher: ILauncher = new CDPLauncher(config);

        super(server, config, launcher);
    }
}
