/**
 * @fileoverview Hint to validate if the CSS features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { StyleEvents } from '@hint/parser-css/dist/src/types';

import { NextAPIHint } from './core/next-hint';
import { CompatNamespace } from './enums';
import meta from './meta/css-next';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class CSSNextAPIHint extends NextAPIHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        super(CompatNamespace.CSS, context);
    }
}
