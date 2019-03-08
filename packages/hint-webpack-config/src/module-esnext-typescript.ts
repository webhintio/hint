/**
 * @fileoverview `webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file.
 */
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigEvents, WebpackConfigParse } from '@hint/parser-webpack-config';
import { TypeScriptConfigEvents, TypeScriptConfigParse } from '@hint/parser-typescript-config';

const debug: debug.IDebugger = d(__filename);

import meta from './meta/module-esnext-typescript';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigModuleESNextTypescript implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents & TypeScriptConfigEvents>) {

        let webpackEvent: WebpackConfigParse;
        let typescriptEvent: TypeScriptConfigParse;

        const webpackConfigReceived = (webpackConfigEvent: WebpackConfigParse) => {
            debug(`parse::end::webpack-config received`);

            webpackEvent = webpackConfigEvent;
        };

        const typescriptConfigReceived = (typescriptConfigEvent: TypeScriptConfigParse) => {
            debug(`parse::end::typescript-config received`);

            typescriptEvent = typescriptConfigEvent;
        };

        const validate = () => {
            if (!webpackEvent) {
                context.report('', 'The parser webpack-config should be activated');

                return;
            }

            if (!typescriptEvent) {
                context.report('', 'The parser typescript-config should be activated');

                return;
            }

            const version = parseInt(webpackEvent.version);

            if (version < 2) {
                return;
            }

            if (typescriptEvent.config.compilerOptions && (typescriptEvent.config.compilerOptions.module as any).toLowerCase() !== 'esnext') {
                context.report(typescriptEvent.resource, 'TypeScript `compilerOptions.module` option should be `esnext`');
            }
        };

        context.on('parse::end::webpack-config', webpackConfigReceived);
        context.on('parse::end::typescript-config', typescriptConfigReceived);
        context.on('scan::end', validate);
    }
}
