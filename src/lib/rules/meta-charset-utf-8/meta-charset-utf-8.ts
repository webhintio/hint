/**
 * @fileoverview Check if a `<meta charset="utf-8">` is specified
 * as the first thing in `<head>`.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import { IAsyncHTMLDocument, IElementFoundEvent, IRule, IRuleBuilder, ITraverseEndEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        // This function exists because not all collector (e.g.: jsdom)
        // support matching attribute values case-insensitively.
        //
        // https://www.w3.org/TR/selectors4/#attribute-case

        const getCharsetMetaTags = (elements) => {
            return elements.filter((element) => {
                return (element.getAttribute('charset') !== null) ||
                       (element.getAttribute('http-equiv') !== null && element.getAttribute('http-equiv').toLowerCase() === 'content-type');
            });
        };

        const isHTMLDocument = (targetURL: string, responseHeaders: object) => {

            // If it's a local file, just presume it's a HTML document.
            // TODO: Change this!

            if (url.parse(targetURL).protocol === 'file:') {
                return true;
            }

            // Otherwise, check.

            const contentTypeHeader = responseHeaders['content-type'];
            const mediaType = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : null;

            return mediaType === 'text/html';

        };

        const validate = async (event: ITraverseEndEvent) => {
            const { resource } = event;

            // The following checks don't make sense for non-HTML documents.

            if (!isHTMLDocument(resource, context.pageHeaders)) {
                return;
            }

            // There are 2 versions of the charset meta tag:
            //
            //  * <meta charset="<charset">
            //  * <meta http-equiv="content-type" content="text/html; charset=<charset>">
            //
            // Also, there is a XML declaration:
            //
            //  * <?xml version="1.0" encoding="<charset>"?>
            //
            // but for regular HTML, it should not be used.

            const pageDOM = <IAsyncHTMLDocument>context.pageDOM;
            const charsetMetaTags = getCharsetMetaTags(await pageDOM.querySelectorAll('meta'));

            if (charsetMetaTags.length === 0) {
                await context.report(resource, null, 'No charset meta tag was specified');

                return;
            }

            // Treat the first charset meta tag as the one
            // the user intended to use, and check if it's:

            const charsetMetaTag = charsetMetaTags[0];

            // * `<meta charset="utf-8">`

            if (charsetMetaTag.getAttribute('http-equiv') !== null) {
                await context.report(resource, charsetMetaTag, `Use shorter '<meta charset="utf-8">'`);
            } else if (charsetMetaTag.getAttribute('charset').toLowerCase() !== 'utf-8') {
                await context.report(resource, charsetMetaTag, `The value of 'charset' is not 'utf-8'`);
            }

            // * specified as the first thing in `<head>`
            //
            // Note: The Charset meta tag should be included completely
            //       within the first 1024 bytes of the document, but
            //       that check will be done by the html/markup validator.

            const firstHeadElement = (await pageDOM.querySelectorAll('head :first-child'))[0];
            const headElementContent = await (await pageDOM.querySelectorAll('head'))[0].outerHTML();

            if (!firstHeadElement || !firstHeadElement.isSame(charsetMetaTag) ||
                !(/^<head[^>]*>\s*<meta/).test(headElementContent)) {
                await context.report(resource, charsetMetaTag, `Charset meta tag should be the first thing in '<head>'`);
            }

            // * specified in the `<body>`.

            const bodyMetaTags = getCharsetMetaTags(await pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaTags.length > 0) && bodyMetaTags[0].isSame(charsetMetaTag)) {
                await context.report(resource, charsetMetaTag, `Meta tag should not be specified in the '<body>'`);

                return;
            }

            // All other charset meta tags should not be included.

            if (charsetMetaTags.length > 1) {
                const metaTags = charsetMetaTags.slice(1);

                for (const metaTag of metaTags) {
                    await context.report(resource, metaTag, 'A charset meta tag was already specified');
                }
            }

            // Same goes for the XML declaration.
            // TODO: Enable it once `jsdom` returns the correct content

            // const xmlDeclaration = context.pageContent.match(/^\s*(<\?xml\s[^>]*encoding=.*\?>)/i);
            //
            // if (xmlDeclaration) {
            //     await context.report(resource, null, `Unneeded XML declaration: '${xmlDeclaration[1]}'`);
            // }
        };

        return { 'traverse::end': validate };
    },
    meta: {
        docs: {
            category: 'misc',
            description: 'Use `<meta charset="utf-8">`',
            recommended: true
        },
        fixable: 'code',
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
