/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta/css';
import { CompatNamespace } from './enums';
import { DeprecatedAPIHint } from './core/deprecated-hint';
import { StyleEvents, StyleParse } from '@hint/parser-css/dist/src/types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class CSSDeprecatedAPIHint extends DeprecatedAPIHint<StyleEvents, StyleParse> {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        super(CompatNamespace.CSS, context);
    }
}
