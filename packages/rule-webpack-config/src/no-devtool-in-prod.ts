/**
 * @fileoverview `webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { RuleScope } from 'hint/dist/src/lib/enums/rulescope';
import { RuleContext } from 'hint/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigParse } from '@hint/parser-webpack-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigNoDevtoolInProd implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/no-devtool-in-prod` warns against having set the propety `devtool` to `eval`'
        },
        id: 'webpack-config/no-devtool-in-prod',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {

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
