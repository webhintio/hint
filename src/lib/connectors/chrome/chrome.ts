/**
 * @fileoverview Connector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
*/

/* eslint-disable new-cap  */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { Connector } from '../debugging-protocol-common/debugging-protocol-connector';
import { IConnector, IConnectorBuilder, ILauncher } from '../../types';
import { CDPLauncher } from './chrome-launcher';

import { Sonar } from '../../sonar';

class ChromeConnector extends Connector {
    public constructor(server: Sonar, config: object, launcher: ILauncher) {
        super(server, config, launcher);
    }
}

const builder: IConnectorBuilder = (server: Sonar, config): IConnector => {
    const launcher = new CDPLauncher({});
    const connector = new ChromeConnector(server, config, launcher);

    return connector;
};

export default builder;
