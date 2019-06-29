/**
 * @fileoverview `webpack-config/is-installed` warns against not having webpack installed.
 */
import { HintContext, IHint } from 'hint';
import { debug as d } from '@hint/utils';

import { WebpackConfigEvents } from '@hint/parser-webpack-config';

import meta from './meta/is-installed';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigIsInstalled implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents>) {

        const notInstall = () => {
            debug(getMessage('eventReceived', context.language, 'parse::error::webpack-config::not-install'));

            context.report('', getMessage('isInstalled', context.language));
        };

        context.on('parse::error::webpack-config::not-install', notInstall);
    }
}
