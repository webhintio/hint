/**
 * @fileoverview Hint to validate if the doctype is correct
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, IAsyncHTMLElement } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { convertBrowserSupportCollectionToMDN, userBrowsers } from './helpers';

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
        id: 'compat-api-css',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const onParseCSS = async (styleParse: StyleParse): Promise<void> => {
            debugger

            const userObject = {
                Chrome: { min: '67', max: '68' },
                ios_saf: { min: '11.0', max: '11.8' },
                and_uc: { min: '11.8', max: null }
              }

              const a = convertBrowserSupportCollectionToMDN(userObject);


              const browsersList = [
                "and_chr 69","and_uc 11.8","chrome 69","chrome 68","edge 17","firefox 62","firefox 61","ie 11","ios_saf 11.3-11.4","ios_saf 11.0-11.2","op_mini all","safari 11.1"
                ]

              const b = userBrowsers.convert(browsersList);
              console.log(b);
              console.log(a);
        };


        context.on('parse::css::end', onParseCSS);
    }
}
