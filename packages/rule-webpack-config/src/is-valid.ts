/**
 * @fileoverview `webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { RuleScope } from 'hint/dist/src/lib/enums/rulescope';
import { RuleContext } from 'hint/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigInvalidConfiguration } from '@hint/parser-webpack-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigIsValid implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`'
        },
        id: 'webpack-config/is-valid',
        schema: [],
        scope: RuleScope.local
    }

    public constructor(context: RuleContext) {

        const invalidConfigurationFile = async (webpackConfigInvalid: WebpackConfigInvalidConfiguration) => {
            const { error, resource } = webpackConfigInvalid;

            debug(`parse::webpack-config::error::configuration received`);

            await context.report(resource, null, error.message);
        };

        context.on('parse::webpack-config::error::configuration', invalidConfigurationFile);
    }
}
