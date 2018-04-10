/**
 * @fileoverview `webpack-config/is-installed` warns against not having webpack installed.
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigIsInstalled implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/is-installed` warns against not having webpack installed'
        },
        id: 'webpack-config/is-installed',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {

        const notInstall = async () => {
            debug(`parse::webpack-config::error::not-install received`);

            await context.report('', null, 'webpack is not installed in your project.');
        };

        context.on('parse::webpack-config::error::not-install', notInstall);
    }
}
