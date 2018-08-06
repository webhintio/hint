/**
 * @fileoverview Check if a `<meta charset="utf-8">` is specified
 * as the first thing in `<head>`.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as cheerio from 'cheerio';

import { Category } from 'hint/dist/src/lib/enums/category';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IHint, FetchEnd, HintMetadata, TraverseEnd } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaCharsetUTF8Hint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: 'Require `<meta charset="utf-8">`'
        },
        id: 'meta-charset-utf-8',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        let receivedDOM;
        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getCharsetMetaElements = (elements: Array<IAsyncHTMLElement>): Array<IAsyncHTMLElement> => {
            return elements.filter((element) => {
                return (element.getAttribute('charset') !== null) ||
                    (element.getAttribute('http-equiv') !== null && normalizeString(element.getAttribute('http-equiv')) === 'content-type');
            });
        };

        /** Stores the DOM received on the initial load */
        const setReceivedDom = (event: FetchEnd) => {
            // The first time we receive this event is the main content, we don't care about iframes, requests by ads, etc.
            /* istanbul ignore if */
            if (typeof receivedDOM !== 'undefined') {
                return;
            }

            receivedDOM = event.response.body.content ?
                cheerio.load(event.response.body.content) :
                cheerio.load('');
        };

        const validate = async (event: TraverseEnd) => {
            const { resource }: { resource: string } = event;

            /*
             * There are 2 versions of the charset meta element:
             *
             *  * <meta charset="charset">
             *  * <meta http-equiv="content-type" content="text/html; charset=<charset>">
             *
             * Also, there is a XML declaration:
             *
             *  * <?xml version="1.0" encoding="<charset>"?>
             *
             * but for regular HTML, it should not be used.
             */

            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const charsetMetaElements: Array<IAsyncHTMLElement> = getCharsetMetaElements(await pageDOM.querySelectorAll('meta'));

            if (charsetMetaElements.length === 0) {
                await context.report(resource, null, `'charset' meta element was not specified.`);

                return;
            }

            /*
             * Treat the first charset meta element as the one
             * the user intended to use, and check if it's:
             */

            const charsetMetaElement: IAsyncHTMLElement = charsetMetaElements[0];

            // * `<meta charset="utf-8">`

            if (charsetMetaElement.getAttribute('http-equiv') !== null) {
                await context.report(resource, charsetMetaElement, `'charset' meta element should be specified using shorter '<meta charset="utf-8">' form.`);
            } else if (normalizeString(charsetMetaElement.getAttribute('charset')) !== 'utf-8') {
                await context.report(resource, charsetMetaElement, `'charset' meta element value should be 'utf-8', not '${charsetMetaElement.getAttribute('charset')}'.`);
            }

            /*
             * * specified as the first thing in `<head>`
             *
             * Note: The Charset meta element should be included completely
             *       within the first 1024 bytes of the document, but
             *       that check will be done by the html/markup validator.
             */
            const charsetMetaElementsHTML = await charsetMetaElement.outerHTML();
            const firstHeadElement = receivedDOM('head :first-child')[0];
            const receivedMetas = receivedDOM('meta');
            const firstMeta = receivedMetas.length > 0 ? receivedMetas[0] : '';
            const firstMetaHTML = firstMeta ? receivedDOM.html(firstMeta) : '';
            const headElementContent: string = receivedDOM.html(receivedDOM('head'));

            if (!firstHeadElement ||
                firstHeadElement !== receivedMetas[0] ||
                !firstMetaHTML ||
                charsetMetaElementsHTML !== firstMetaHTML ||
                !(/^<head[^>]*>\s*<meta/).test(headElementContent)) {

                await context.report(resource, charsetMetaElement, `'charset' meta element should be the first thing in '<head>'.`);
            }

            // * specified in the `<body>`.

            const bodyMetaElements: Array<IAsyncHTMLElement> = getCharsetMetaElements(await pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(charsetMetaElement)) {
                await context.report(resource, charsetMetaElement, `'charset' meta element should be specified in the '<head>', not '<body>'.`);

                return;
            }

            // All other charset meta elements should not be included.

            if (charsetMetaElements.length > 1) {
                const metaElements = charsetMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    await context.report(resource, metaElement, `'charset' meta element is not needed as one was already specified.`);
                }
            }

            /*
             * Same goes for the XML declaration.
             * TODO: Enable it once `jsdom` returns the correct content
             * const xmlDeclaration = context.pageContent.match(/^\s*(<\?xml\s[^>]*encoding=.*\?>)/i);
             *
             * if (xmlDeclaration) {
             *     await context.report(resource, null, `Unneeded XML declaration: '${xmlDeclaration[1]}'.`);
             * }
             */
        };

        context.on('fetch::end::html', setReceivedDom);
        context.on('traverse::end', validate);
    }
}
