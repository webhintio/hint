/**
 * @fileoverview `webpack-config/config-exists` warns against not having a webpack configuration file.
 */
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigEvents } from '@hint/parser-webpack-config';

import meta from './meta/config-exists';

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
            debug(`parse::error::webpack-config::not-found received`);

            context.report('', 'webpack configuration file not found in your project.');
        };

        context.on('parse::error::webpack-config::not-found', notFound);
    }
}
