/**
 * @fileoverview Hint to validate if the HTML features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import meta from './meta/html';
import { CompatNamespace } from './enums';
import { DeprecatedAPIHint } from './core/deprecated-hint';
import { DEFAULT_HTML_IGNORE } from './helpers';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLDeprecatedAPIHint extends DeprecatedAPIHint<Events, Event> {
    public static readonly meta = meta;

    public constructor(context: HintContext<Events>) {
        super(CompatNamespace.HTML, context);
    }

    public getDefaultHintOptions(): any {
        return { ignore: DEFAULT_HTML_IGNORE };
    }
}
