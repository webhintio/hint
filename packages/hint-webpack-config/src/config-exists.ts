/**
 * @fileoverview `webpack-config/config-exists` warns against not having a webpack configuration file.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigEvents } from '@hint/parser-webpack-config';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigConfigExists implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/config-exists` warns against not having a webpack configuration file'
        },
        id: 'webpack-config/config-exists',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext<WebpackConfigEvents>) {

        const notFound = async () => {
            debug(`parse::error::webpack-config::not-found received`);

            await context.report('', 'webpack configuration file not found in your project.');
        };

        context.on('parse::error::webpack-config::not-found', notFound);
    }
}
