/**
 * @fileoverview `webpack-config/config-exists` warns against not having a webpack configuration file.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents } from '@hint/parser-webpack-config';

import meta from './meta/config-exists';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigConfigExists implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents>) {

        const notFound = () => {
            debug(`'parse::error::webpack-config::not-found' received`);

            context.report('', getMessage('configExists', context.language));
        };

        context.on('parse::error::webpack-config::not-found', notFound);
    }
}
