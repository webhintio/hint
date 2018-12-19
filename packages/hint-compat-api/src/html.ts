/**
 * @fileoverview Hint to validate if the HTML features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents, HTMLParse } from '@hint/parser-html/dist/src/types';

import meta from './meta/html';
import { CompatNamespace } from './enums';
import { DeprecatedAPIHint } from './core/deprecated-hint';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLDeprecatedAPIHint extends DeprecatedAPIHint<HTMLEvents, HTMLParse> {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(CompatNamespace.HTML, context);
    }
}
