/**
 * @fileoverview `webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents, WebpackConfigParse } from '@hint/parser-webpack-config';
import { BabelConfigEvents, BabelConfigParsed } from '@hint/parser-babel-config';

import meta from './meta/modules-false-babel';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigModulesFalseBabel implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents & BabelConfigEvents>) {

        let webpackEvent: WebpackConfigParse;
        let babelEvent: BabelConfigParsed;

        const webpackConfigReceived = (webpackConfigEvent: WebpackConfigParse) => {
            debug(`parse::end::webpack-config received`);

            webpackEvent = webpackConfigEvent;
        };

        const babelConfigReceived = (babelConfigEvent: BabelConfigParsed) => {
            debug(`parse::end::babel-config received`);

            babelEvent = babelConfigEvent;
        };

        const validate = () => {
            if (!webpackEvent) {
                context.report('', 'The parser webpack-config should be activated');

                return;
            }

            if (!babelEvent) {
                context.report('', 'The parser babel-config should be activated');

                return;
            }

            const version = parseInt(webpackEvent.version);
            const presets = babelEvent.config.presets;

            if (version < 2 || !presets || presets.length === 0) {
                return;
            }

            const modulesFalse = (presets as any[][]).filter((preset) => {
                return preset.length > 1 && preset[1].modules === false;
            });

            if (modulesFalse.length === 0) {
                context.report(babelEvent.resource, 'Babel presets `modules` option should be `false`');
            }
        };

        context.on('parse::end::webpack-config', webpackConfigReceived);
        context.on('parse::end::babel-config', babelConfigReceived);
        context.on('scan::end', validate);
    }
}
