/**
 * @fileoverview Hint to validate if the HTML features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import meta from './meta/html-next';
import { CompatNamespace } from './enums';
import { NextAPIHint } from './core/next-hint';
import { DEFAULT_HTML_IGNORE } from './helpers';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLNextAPIHint extends NextAPIHint<Events, Event> {
    public static readonly meta = meta;

    public constructor(context: HintContext<Events>) {
        super(CompatNamespace.HTML, context);
    }

    public getDefaultHintOptions(): any {
        return { ignore: DEFAULT_HTML_IGNORE };
    }
}
