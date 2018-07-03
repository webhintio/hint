/**
 * @fileoverview `webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigParse } from '@hint/parser-webpack-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigNoDevtoolInProd implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`'
        },
        id: 'webpack-config/no-devtool-in-prod',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {

        const configReceived = async (webpackConfigEvent: WebpackConfigParse) => {
            const { config, resource } = webpackConfigEvent;

            debug(`parse::webpack-config::end received`);

            if (config.devtool && config.devtool.toString().includes('eval')) {
                await context.report(resource, null, `\`${config.devtool.toString()}\` not recommended for prodution`);
            }
        };

        context.on('parse::webpack-config::end', configReceived);
    }
}
