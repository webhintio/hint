/**
 * @fileoverview Hint to validate if the HTML features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '../../parser-html/dist/src/types';

import BaseHTMLHint from './html-base';
import meta from './meta/html';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLHint extends BaseHTMLHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(context, false);
    }
}
