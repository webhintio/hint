/**
 * @fileoverview `webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`.
 */
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents, WebpackConfigParse } from '@hint/parser-webpack-config';

import meta from './meta/no-devtool-in-prod';

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

            debug(`parse::end::webpack-config received`);

            if (config.devtool && config.devtool.toString().includes('eval')) {
                context.report(resource, `\`${config.devtool.toString()}\` not recommended for prodution`);
            }
        };

        context.on('parse::end::webpack-config', configReceived);
    }
}
