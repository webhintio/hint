/**
 * @fileoverview `webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents, WebpackConfigInvalidConfiguration } from '@hint/parser-webpack-config';

import meta from './meta/is-valid';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigIsValid implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents>) {

        const invalidConfigurationFile = (webpackConfigInvalid: WebpackConfigInvalidConfiguration) => {
            const { error, resource } = webpackConfigInvalid;

            debug(getMessage('eventReceived', context.language, 'parse::error::webpack-config::configuration'));

            context.report(resource, error.message);
        };

        context.on('parse::error::webpack-config::configuration', invalidConfigurationFile);
    }
}
