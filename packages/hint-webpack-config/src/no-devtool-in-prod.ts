/**
 * @fileoverview `webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents, WebpackConfigParse } from '@hint/parser-webpack-config';

import meta from './meta/no-devtool-in-prod';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigNoDevtoolInProd implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents>) {

        const configReceived = (webpackConfigEvent: WebpackConfigParse) => {
            const { config, resource } = webpackConfigEvent;

            debug(getMessage('eventReceived', context.language, 'parse::end::webpack-config'));

            if (config.devtool && config.devtool.toString().includes('eval')) {
                context.report(resource, getMessage('noEval', context.language, config.devtool.toString()));
            }
        };

        context.on('parse::end::webpack-config', configReceived);
    }
}
