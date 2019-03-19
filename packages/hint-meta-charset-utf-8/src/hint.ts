/**
 * @fileoverview Check if a `<meta charset="utf-8">` is specified
 * as the first thing in `<head>`.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { IHint } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import { HTMLEvents } from '@hint/parser-html';

import meta from './meta';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaCharsetUTF8Hint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        let validated = false;

        context.on('scan::end', () => {
            validated = false;
        });

        context.on('parse::end::html', ({ document, html, resource }) => {
            // The first time we receive this event is the main content, we don't care about iframes, requests by ads, etc.
            if (validated) {
                return;
            }

            validated = true;

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

            const charsetMetaElements = document.querySelectorAll('meta[charset], meta[http-equiv="content-type" i]');

            if (charsetMetaElements.length === 0) {
                context.report(resource, `'charset' meta element was not specified.`);

                return;
            }

            /*
             * Treat the first charset meta element as the one
             * the user intended to use, and check if it's:
             */

            const charsetMetaElement = charsetMetaElements[0];

            // * `<meta charset="utf-8">`

            if (charsetMetaElement.getAttribute('http-equiv') !== null) {
                context.report(resource, `'charset' meta element should be specified using shorter '<meta charset="utf-8">' form.`, { element: charsetMetaElement });
            } else if (normalizeString(charsetMetaElement.getAttribute('charset')) !== 'utf-8') {
                context.report(resource, `'charset' meta element value should be 'utf-8', not '${charsetMetaElement.getAttribute('charset')}'.`, { element: charsetMetaElement });
            }

            /*
             * * specified as the first thing in `<head>`
             *
             * Note: The Charset meta element should be included completely
             *       within the first 1024 bytes of the document, but
             *       that check will be done by the html/markup validator.
             */

            const firstHeadElement = document.querySelectorAll('head :first-child')[0];
            const isCharsetMetaFirstHeadElement = charsetMetaElement && firstHeadElement && charsetMetaElement.isSame(firstHeadElement);

            const headElementContent = document.querySelectorAll('head')[0].outerHTML;
            const isMetaElementFirstHeadContent = (/^<head[^>]*>\s*<meta/).test(headElementContent);

            if (!isCharsetMetaFirstHeadElement || !isMetaElementFirstHeadContent) {
                context.report(resource, `'charset' meta element should be the first thing in '<head>'.`, { element: charsetMetaElement });
            }

            // * specified in the `<body>`.

            const bodyMetaElements = document.querySelectorAll('body meta[charset], body meta[http-equiv="content-type" i]');

            if (bodyMetaElements[0] && bodyMetaElements[0].isSame(charsetMetaElement)) {
                context.report(resource, `'charset' meta element should be specified in the '<head>', not '<body>'.`, { element: charsetMetaElement });

                return;
            }

            // All other charset meta elements should not be included.

            if (charsetMetaElements.length > 1) {
                const metaElements = charsetMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    context.report(resource, `'charset' meta element is not needed as one was already specified.`, { element: metaElement });
                }
            }

            /*
             * Same goes for the XML declaration.
             * TODO: Enable it once `jsdom` returns the correct content
             * const xmlDeclaration = context.pageContent.match(/^\s*(<\?xml\s[^>]*encoding=.*\?>)/i);
             *
             * if (xmlDeclaration) {
             *     context.report(resource, `Unneeded XML declaration: '${xmlDeclaration[1]}'.`);
             * }
             */
        });
    }
}
