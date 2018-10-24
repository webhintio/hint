/**
 * @fileoverview Hint to validate if the HTML, CSS and JS APIs of the project are deprecated or not broadly supported
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers } from './helpers';

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
            description: `Hint to validate if the HTML, CSS and JS APIs of the project are deprecated or not broadly supported`
        },
        id: 'compat-api-css',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const onParseCSS = (styleParse: StyleParse): void => {

            // Internal testing purposes
            const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
            const compatApi = new CompatApi('css', mdnBrowsersCollection);

            console.log(compatApi, styleParse);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
