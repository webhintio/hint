/**
 * @fileoverview Hint to validate if the CSS features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { StyleEvents, StyleParse } from '@hint/parser-css/dist/src/types';

import meta from './meta/css-next';
import { CompatNamespace } from './enums';
import { NextAPIHint } from './core/next-hint';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class CSSNextAPIHint extends NextAPIHint<StyleEvents, StyleParse> {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        super(CompatNamespace.CSS, context);
    }
}
