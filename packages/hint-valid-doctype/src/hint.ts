/**
 * @fileoverview Hint to validate if the doctype is correct
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { HTMLParse } from '@hint/parser-html';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Hint to validate if the doctype is correct`
        },
        id: 'valid-doctype',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const validateDoctype = async (html: HTMLParse) => {
            debug(`Validating doctype`);
            console.log(html);
        };

        context.on('parse::html::end', validateDoctype);
    }
}
