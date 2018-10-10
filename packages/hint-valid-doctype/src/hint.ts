/**
 * @fileoverview Hint to validate if the doctype is correct
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, FetchEnd } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

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

        const onFetchEndHTML = async (fetchEnd: FetchEnd) => {
            debug(`Validating doctype`);
            console.log(fetchEnd);
        };

        context.on('fetch::end::html', onFetchEndHTML);
    }
}
