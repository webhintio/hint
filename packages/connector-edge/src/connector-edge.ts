/**
 * @fileoverview Connector for Edge 15 that uses [edge-diagnostics-adapter](https://github.com/Microsoft/Edge-diagnostics-adapter)
 * to load a site and do the traversing.
 */

import { Connector } from '@sonarwhal/utils-debugging-protocol-common/dist/src/debugging-protocol-connector';
import { ILauncher } from 'sonarwhal/dist/src/lib/types';
import { EdgeLauncher } from './connector-edge-launcher';

import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';

export default class EdgeConnector extends Connector {
    public constructor(server: Sonarwhal, config: object) {
        const edgeRequiredConfig = {
            tabUrl: 'https://empty.sonarwhal.com/',
            useTabUrl: true
        };
        const edgeConfig = Object.assign({}, edgeRequiredConfig, config);
        const launcher: ILauncher = new EdgeLauncher(edgeConfig);

        super(server, config, launcher);
    }
}
