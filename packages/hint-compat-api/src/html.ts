/**
 * @fileoverview Hint to validate if the HTML features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '../../parser-html/dist/src/types';

import BaseCompatApiHTML from './html-base';
import meta from './meta/html';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class extends BaseCompatApiHTML {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(context, false);
    }
}
