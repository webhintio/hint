/**
 * @fileoverview `webpack-config/is-installed` warns against not having webpack installed.
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

export default class WebpackConfigIsInstalled implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/is-installed` warns against not having webpack installed'
        },
        id: 'webpack-config/is-installed',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {

        const notInstall = async () => {
            debug(`parse::webpack-config::error::not-install received`);

            await context.report('', null, 'webpack is not installed in your project.');
        };

        context.on('parse::webpack-config::error::not-install', notInstall);
    }
}
