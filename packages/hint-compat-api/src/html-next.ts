/**
 * @fileoverview Hint to validate if the HTML features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta/html-next';
import { CompatNamespace } from './enums';
import { NextAPIHint } from './core/next-hint';
import { HTMLEvents, HTMLParse } from '@hint/parser-html/dist/src/types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLNextAPIHint extends NextAPIHint<HTMLEvents, HTMLParse> {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(CompatNamespace.HTML, context);
    }
}
