import * as webpack from 'webpack';

import { ErrorEvent, Event, Events } from 'hint';

/** Data type sent for Invalid configuation event */
export type WebpackConfigInvalidConfiguration = ErrorEvent;

/** The object emitted by the `webpack-config` parser */
export type WebpackConfigParse = Event & {
    /** The webpack config parsed */
    config: webpack.Configuration;
    /** webpack version installed */
    version: string;
};

export type WebpackConfigEvents = Events & {
    'parse::end::webpack-config': WebpackConfigParse;
    'parse::error::webpack-config::configuration': WebpackConfigInvalidConfiguration;
    'parse::error::webpack-config::not-found': ErrorEvent;
    'parse::error::webpack-config::not-install': ErrorEvent;
    'parse::start::webpack-config': Event;
};
