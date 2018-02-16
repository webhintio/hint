/**
 * @fileoverview Connector for Edge 15 that uses [edge-diagnostics-adapter](https://github.com/Microsoft/Edge-diagnostics-adapter)
 * to load a site and do the traversing.
 */

import { Connector } from 'sonarwhal/dist/src/lib/connectors/debugging-protocol-common/debugging-protocol-connector';
import { IConnector, IConnectorBuilder, ILauncher } from 'sonarwhal/dist/src/lib/types';
import { EdgeLauncher } from './connector-edge-launcher';

import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';

class EdgeConnector extends Connector {
    public constructor(server: Sonarwhal, config: object, launcher: ILauncher) {
        super(server, config, launcher);
    }
}

const builder: IConnectorBuilder = (server: Sonarwhal, config): IConnector => {
    const edgeRequiredConfig = {
        tabUrl: 'https://empty.sonarwhal.com/',
        useTabUrl: true
    };
    const edgeConfig = Object.assign({}, edgeRequiredConfig, config);
    const launcher = new EdgeLauncher(edgeConfig);
    const collector = new EdgeConnector(server, edgeConfig, launcher);

    return collector;
};

export default builder;
