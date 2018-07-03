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

    private webpackEvent: WebpackConfigParse;
    private typescriptEvent: TypeScriptConfigParse;

    public constructor(context: HintContext) {

        const webpackConfigReceived = (webpackConfigEvent: WebpackConfigParse) => {
            debug(`parse::webpack-config::end received`);

            this.webpackEvent = webpackConfigEvent;
        };

        const typescriptConfigReceived = (typescriptConfigEvent: TypeScriptConfigParse) => {
            debug(`parse::typescript-config::end received`);

            this.typescriptEvent = typescriptConfigEvent;
        };

        const validate = async () => {
            if (!this.webpackEvent) {
                await context.report('', null, 'The parser webpack-config should be activated');

                return;
            }

            if (!this.typescriptEvent) {
                await context.report('', null, 'The parser typescript-config should be activated');

                return;
            }

            const version = parseInt(this.webpackEvent.version);

            if (version < 2) {
                return;
            }

            if (this.typescriptEvent.config.compilerOptions && this.typescriptEvent.config.compilerOptions.module !== 'esnext') {
                await context.report(this.typescriptEvent.resource, null, 'TypeScript `compilerOptions.module` option should be `esnext`');
            }
        };

        context.on('parse::webpack-config::end', webpackConfigReceived);
        context.on('parse::typescript-config::end', typescriptConfigReceived);
        context.on('scan::end', validate);
    }
}
