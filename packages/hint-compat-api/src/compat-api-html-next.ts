/**
 * @fileoverview Hint to validate if the HTML features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '../../parser-html/dist/src/types';

import BaseCompatApiHTML from './compat-api-html-base';
import meta from './meta/compat-api-html-next';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class extends BaseCompatApiHTML {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(context, true);
    }
}
