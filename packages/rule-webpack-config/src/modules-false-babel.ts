/**
 * @fileoverview `webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file.
 */
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';

import { WebpackConfigParse } from '@sonarwhal/parser-webpack-config/dist/src/types';
import { BabelConfigParsed } from '@sonarwhal/parser-babel-config/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigModulesFalseBabel implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: '`webpack-config/modules-false-babel` warns against not having set the propety `modules` to `false` in presets in babel configuration file'
        },
        id: 'webpack-config/modules-false-babel',
        schema: [],
        scope: RuleScope.local
    }

    private webpackEvent: WebpackConfigParse;
    private babelEvent: BabelConfigParsed;

    public constructor(context: RuleContext) {

        const webpackConfigReceived = (webpackConfigEvent: WebpackConfigParse) => {
            debug(`parse::webpack-config::end received`);

            this.webpackEvent = webpackConfigEvent;
        };

        const babelConfigReceived = (babelConfigEvent: BabelConfigParsed) => {
            debug(`parse::babel-config::end received`);

            this.babelEvent = babelConfigEvent;
        };

        const validate = async () => {
            if (!this.webpackEvent) {
                await context.report('', null, 'The parser webpack-config should be activated');

                return;
            }

            if (!this.babelEvent) {
                await context.report('', null, 'The parser babel-config should be activated');

                return;
            }

            const version = parseInt(this.webpackEvent.version);
            const presets = this.babelEvent.config.presets;

            if (version < 2 || !presets || presets.length === 0) {
                return;
            }

            const modulesFalse = (presets as Array<Array<any>>).filter((preset) => {
                return preset.length > 1 && preset[1].modules === false;
            });

            if (modulesFalse.length === 0) {
                await context.report(this.babelEvent.resource, null, 'Babel presets `modules` option should be `false`');
            }
        };

        context.on('parse::webpack-config::end', webpackConfigReceived);
        context.on('parse::babel-config::end', babelConfigReceived);
        context.on('scan::end', validate);
    }
}
