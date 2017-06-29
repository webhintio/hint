/**
 * @fileoverview Collector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
*/

/* eslint-disable new-cap  */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { AsyncHTMLDocument, AsyncHTMLElement } from '../shared/async-html'; //eslint-disable-line no-unused-vars
import { Collector } from '../shared/remote-debugging-collector';
import { ICollector, ICollectorBuilder, ILauncher } from '../../types'; //eslint-disable-line no-unused-vars
import { CDPLauncher } from './cdp-launcher';

import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars

class CDPCollector extends Collector {
    constructor(server: Sonar, config: object, launcher: ILauncher) {
        super(server, config, launcher);
    }
}

const builder: ICollectorBuilder = (server: Sonar, config): ICollector => {
    const launcher = new CDPLauncher({});
    const collector = new CDPCollector(server, config, launcher);

    return collector;
};

export default builder;
