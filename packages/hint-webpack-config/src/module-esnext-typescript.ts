/**
 * @fileoverview `webpack-config/module-esnext-typescript` warns against not having set the propety `compilerOptions.module` to `esnext` in typescript configuration file.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents, WebpackConfigParse } from '@hint/parser-webpack-config';
import { TypeScriptConfigEvents, TypeScriptConfigParse } from '@hint/parser-typescript-config';

const debug: debug.IDebugger = d(__filename);

import meta from './meta/module-esnext-typescript';
import { getMessage } from './i18n.import';

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
            debug(`'parse::end::webpack-config' received`);

            webpackEvent = webpackConfigEvent;
        };

        const typescriptConfigReceived = (typescriptConfigEvent: TypeScriptConfigParse) => {
            debug(`'parse::end::typescript-config' received`);

            typescriptEvent = typescriptConfigEvent;
        };

        const validate = () => {
            if (!webpackEvent) {
                context.report('', getMessage('webpackParserActivated', context.language));

                return;
            }

            if (!typescriptEvent) {
                context.report('', getMessage('typeScriptParserActivated', context.language));

                return;
            }

            const version = parseInt(webpackEvent.version);

            if (version < 2) {
                return;
            }

            if (typescriptEvent.config.compilerOptions && (typescriptEvent.config.compilerOptions.module as any).toLowerCase() !== 'esnext') {
                context.report(typescriptEvent.resource, getMessage('esnext', context.language));
            }
        };

        context.on('parse::end::webpack-config', webpackConfigReceived);
        context.on('parse::end::typescript-config', typescriptConfigReceived);
        context.on('scan::end', validate);
    }
}
