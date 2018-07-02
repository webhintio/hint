/**
 * @fileoverview `webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigInvalidConfiguration } from '@hint/parser-webpack-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigIsValid implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`'
        },
        id: 'webpack-config/is-valid',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {

        const invalidConfigurationFile = async (webpackConfigInvalid: WebpackConfigInvalidConfiguration) => {
            const { error, resource } = webpackConfigInvalid;

            debug(`parse::webpack-config::error::configuration received`);

            await context.report(resource, null, error.message);
        };

        context.on('parse::webpack-config::error::configuration', invalidConfigurationFile);
    }
}
