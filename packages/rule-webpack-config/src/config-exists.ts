/**
 * @fileoverview `webpack-config/config-exists` warns against not having a webpack configuration file.
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

export default class WebpackConfigConfigExists implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/config-exists` warns against not having a webpack configuration file'
        },
        id: 'webpack-config/config-exists',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {

        const notFound = async () => {
            debug(`parse::webpack-config::error::not-found received`);

            await context.report('', null, 'webpack configuration file not found in your project.');
        };

        context.on('parse::webpack-config::error::not-found', notFound);
    }
}
