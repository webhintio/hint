/**
 * @fileoverview Hint to validate if the HTML features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '@hint/parser-html/dist/src/types';

import { DeprecatedAPIHint } from './core/deprecated-hint';
import { CompatNamespace } from './enums';
import meta from './meta/html';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLDeprecatedAPIHint extends DeprecatedAPIHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(CompatNamespace.HTML, context);
    }
}
