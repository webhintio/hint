/**
 * @fileoverview Connector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
*/

/* eslint-disable new-cap  */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { AsyncHTMLDocument, AsyncHTMLElement } from '../shared/async-html'; // eslint-disable-line no-unused-vars
import { Connector } from '../shared/remote-debugging-connector';
import { IConnector, IConnectorBuilder, ILauncher } from '../../types'; // eslint-disable-line no-unused-vars
import { CDPLauncher } from './cdp-launcher';

import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars

class CDPConnector extends Connector {
    public constructor(server: Sonar, config: object, launcher: ILauncher) {
        super(server, config, launcher);
    }
}

const builder: IConnectorBuilder = (server: Sonar, config): IConnector => {
    const launcher = new CDPLauncher({});
    const connector = new CDPConnector(server, config, launcher);

    return connector;
};

export default builder;
