import * as webpack from 'webpack';

import { Event } from 'sonarwhal/dist/src/lib/types/events';

/** Data type sent for Invalid configuation event */
export type WebpackConfigInvalidConfiguration = Event & {
    error: Error;
};

/** The object emitted by the `webpack-config` parser */
export type WebpackConfigParse = Event & {
    /** The webpack config parsed */
    config: webpack.Configuration;
    /** webpack version installed */
    version: string;
};
