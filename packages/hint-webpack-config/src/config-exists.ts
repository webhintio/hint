/**
 * @fileoverview `webpack-config/config-exists` warns against not having a webpack configuration file.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

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

    public constructor(context: HintContext) {

        const notFound = async () => {
            debug(`parse::webpack-config::error::not-found received`);

            await context.report('', null, 'webpack configuration file not found in your project.');
        };

        context.on('parse::webpack-config::error::not-found', notFound);
    }
}
