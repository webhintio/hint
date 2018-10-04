/**
 * @fileoverview `webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigParse } from '@hint/parser-webpack-config/dist/src/types';
import { BabelConfigParsed } from '@hint/parser-babel-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigModulesFalseBabel implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file'
        },
        id: 'webpack-config/modules-false-babel',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {

        let webpackEvent: WebpackConfigParse;
        let babelEvent: BabelConfigParsed;

        const webpackConfigReceived = (webpackConfigEvent: WebpackConfigParse) => {
            debug(`parse::webpack-config::end received`);

            webpackEvent = webpackConfigEvent;
        };

        const babelConfigReceived = (babelConfigEvent: BabelConfigParsed) => {
            debug(`parse::babel-config::end received`);

            babelEvent = babelConfigEvent;
        };

        const validate = async () => {
            if (!webpackEvent) {
                await context.report('', null, 'The parser webpack-config should be activated');

                return;
            }

            if (!babelEvent) {
                await context.report('', null, 'The parser babel-config should be activated');

                return;
            }

            const version = parseInt(webpackEvent.version);
            const presets = babelEvent.config.presets;

            if (version < 2 || !presets || presets.length === 0) {
                return;
            }

            const modulesFalse = (presets as Array<Array<any>>).filter((preset) => {
                return preset.length > 1 && preset[1].modules === false;
            });

            if (modulesFalse.length === 0) {
                await context.report(babelEvent.resource, null, 'Babel presets `modules` option should be `false`');
            }
        };

        context.on('parse::webpack-config::end', webpackConfigReceived);
        context.on('parse::babel-config::end', babelConfigReceived);
        context.on('scan::end', validate);
    }
}
