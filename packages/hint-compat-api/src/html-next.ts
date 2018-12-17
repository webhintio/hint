/**
 * @fileoverview Hint to validate if the HTML features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '../../parser-html/dist/src/types';

import { NextAPIHint } from './core/next-hint';
import { CompatNamespace } from './enums';
import meta from './meta/html-next';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLNextAPIHint extends NextAPIHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(CompatNamespace.HTML, context);
    }
}
