/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { StyleEvents } from '@hint/parser-css/dist/src/types';

import meta from './meta/css';
import { CompatNamespace } from './enums';
import { DeprecatedAPIHint } from './core/deprecated-hint';
import { DEFAULT_CSS_IGNORE } from './helpers';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class CSSDeprecatedAPIHint extends DeprecatedAPIHint<StyleEvents> {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        super(CompatNamespace.CSS, context);
    }

    public getDefaultHintOptions(): any {
        return { ignore: DEFAULT_CSS_IGNORE };
    }
}
