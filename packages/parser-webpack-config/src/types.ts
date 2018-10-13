import * as webpack from 'webpack';

import { Event, Events } from 'hint/dist/src/lib/types/events';

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

export type WebpackConfigEvents = Events & {
    'parse::webpack-config::end': WebpackConfigParse;
    'parse::webpack-config::error::configuration': WebpackConfigInvalidConfiguration;
    'parse::webpack-config::error::not-found': Event;
    'parse::webpack-config::error::not-install': Event;
};
