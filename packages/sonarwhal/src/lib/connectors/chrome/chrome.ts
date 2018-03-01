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

import { Connector } from '../debugging-protocol-common/debugging-protocol-connector';
import { ILauncher } from '../../types';
import { CDPLauncher } from './chrome-launcher';

import { Sonarwhal } from '../../sonarwhal';

export default class ChromeConnector extends Connector {
    public constructor(server: Sonarwhal, config: object) {
        const launcher: ILauncher = new CDPLauncher(config);

        super(server, config, launcher);
    }
}
