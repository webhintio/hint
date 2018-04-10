/**
 * @fileoverview `webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file.
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

import { WebpackConfigParse } from '@sonarwhal/parser-webpack-config/dist/src/types';
import { TypeScriptConfigParse } from '@sonarwhal/parser-typescript-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigModuleESNextTypescript implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file'
        },
        id: 'webpack-config/module-esnext-typescript',
        schema: [],
        scope: RuleScope.local
    }

    private webpackEvent: WebpackConfigParse;
    private typescriptEvent: TypeScriptConfigParse;

    public constructor(context: RuleContext) {

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
