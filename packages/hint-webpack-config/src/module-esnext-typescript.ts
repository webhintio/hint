/**
 * @fileoverview `webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigParse } from '@hint/parser-webpack-config/dist/src/types';
import { TypeScriptConfigParse } from '@hint/parser-typescript-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigModuleESNextTypescript implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file'
        },
        id: 'webpack-config/module-esnext-typescript',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {

        let webpackEvent: WebpackConfigParse;
        let typescriptEvent: TypeScriptConfigParse;

        const webpackConfigReceived = (webpackConfigEvent: WebpackConfigParse) => {
            debug(`parse::webpack-config::end received`);

            webpackEvent = webpackConfigEvent;
        };

        const typescriptConfigReceived = (typescriptConfigEvent: TypeScriptConfigParse) => {
            debug(`parse::typescript-config::end received`);

            typescriptEvent = typescriptConfigEvent;
        };

        const validate = async () => {
            if (!webpackEvent) {
                await context.report('', null, 'The parser webpack-config should be activated');

                return;
            }

            if (!typescriptEvent) {
                await context.report('', null, 'The parser typescript-config should be activated');

                return;
            }

            const version = parseInt(webpackEvent.version);

            if (version < 2) {
                return;
            }

            if (typescriptEvent.config.compilerOptions && typescriptEvent.config.compilerOptions.module !== 'esnext') {
                await context.report(typescriptEvent.resource, null, 'TypeScript `compilerOptions.module` option should be `esnext`');
            }
        };

        context.on('parse::webpack-config::end', webpackConfigReceived);
        context.on('parse::typescript-config::end', typescriptConfigReceived);
        context.on('scan::end', validate);
    }
}
