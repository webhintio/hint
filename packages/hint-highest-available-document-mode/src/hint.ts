/**
 * @fileoverview Check if browsers that support document modes are
 * informed to use the highest on available.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IHint, TraverseEnd, HintMetadata } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import isLocalFile from 'hint/dist/src/lib/utils/network/is-local-file';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HighestAvailableDocumentModeHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: 'Require highest available document mode'
        },
        id: 'highest-available-document-mode',
        schema: [{
            additionalProperties: false,
            properties: { requireMetaElement: { type: 'boolean' } },
            type: ['object', 'null']
        }],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        let requireMetaElement: boolean = false;
        let suggestRemoval: boolean = false;

        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getXUACompatibleMetaElements = (elements: Array<IAsyncHTMLElement>): Array<IAsyncHTMLElement> => {
            return elements.filter((element: IAsyncHTMLElement) => {
                return (element.getAttribute('http-equiv') !== null &&
                    normalizeString(element.getAttribute('http-equiv')) === 'x-ua-compatible');
            });
        };

        const checkHeader = async (resource: string, responseHeaders: {[header: string]: string}) => {
            const originalHeaderValue = responseHeaders['x-ua-compatible'];
            const headerValue = normalizeString(originalHeaderValue);

            if (headerValue === null) {

                /*
                 * There is no need to require the HTTP header if:
                 *
                 *  * the user required the meta element to be specified.
                 *  * the targeted browsers don't include the ones that
                 *    support document modes
                 */

                if (!requireMetaElement && !suggestRemoval) {
                    await context.report(resource, null, `Response should include 'x-ua-compatible' header.`);
                }

                return;
            }

            /*
             * If the HTTP response header is included, but the targeted
             * browsers don't include the browser that support document
             * modes, suggest not sending the header.
             */

            if (suggestRemoval) {
                await context.report(resource, null, `Response should not include unneeded 'x-ua-compatible' header.`);

                return;
            }

            if (headerValue !== 'ie=edge') {
                await context.report(resource, null, `'x-ua-compatible' header value should be 'ie=edge', not '${!originalHeaderValue ? '' : originalHeaderValue}'.`);
            }

            /*
             * Note: The check if the X-UA-Compatible HTTP response
             *       header is sent for non-HTML documents is covered
             *       by the `no-html-only-headers` hint.
             */

        };

        const checkMetaElement = async (resource: string) => {

            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const XUACompatibleMetaElements: Array<IAsyncHTMLElement> = getXUACompatibleMetaElements(await pageDOM.querySelectorAll('meta'));

            /*
             * By default, if the user did not request the meta
             * element to be specified, prefer the HTTP response
             * header over using the meta element, as the meta
             * element will not always work.
             */

            if (!requireMetaElement || suggestRemoval) {
                if (XUACompatibleMetaElements.length !== 0) {

                    const errorMessage = suggestRemoval ?
                        `'x-ua-compatible' meta element should not be specified as it is not needed.`:
                        `'x-ua-compatible' meta element should not be specified, and instead, equivalent HTTP header should be used.`;

                    for (const metaElement of XUACompatibleMetaElements) {
                        await context.report(resource, metaElement, errorMessage);
                    }
                }

                return;
            }

            // If the user requested the meta element to be specified.

            if (XUACompatibleMetaElements.length === 0) {
                await context.report(resource, null, `'x-ua-compatible' meta element should be specified.`);

                return;
            }

            /*
             * Treat the first X-UA-Compatible meta element as
             * the one the user intended to use, and check if:
             */

            const XUACompatibleMetaElement: IAsyncHTMLElement = XUACompatibleMetaElements[0];
            const contentValue: string = XUACompatibleMetaElement.getAttribute('content');

            // * it has the value `ie=edge`.

            if (normalizeString(contentValue) !== 'ie=edge') {
                await context.report(resource, XUACompatibleMetaElement, `'x-ua-compatible' meta element 'content' attribute value should be 'ie=edge', not '${!contentValue ? '' : contentValue}'.`);
            }

            /*
             * * it's specified in the `<head>` before all
             *   other elements except for the `<title>` and
             *   other `<meta>` elements.
             *
             *   https://msdn.microsoft.com/en-us/library/jj676915.aspx
             */

            const headElements: Array<IAsyncHTMLElement> = await pageDOM.querySelectorAll('head *');
            let metaElementIsBeforeRequiredElements: boolean = true;

            for (const headElement of headElements) {
                if (headElement.isSame(XUACompatibleMetaElement)) {
                    if (!metaElementIsBeforeRequiredElements) {
                        await context.report(resource, XUACompatibleMetaElement, `'x-ua-compatible' meta element should be specified before all other elements except for '<title>' and other '<meta>' elements.`);
                    }

                    break;
                }

                if (!['title', 'meta'].includes(headElement.nodeName.toLowerCase())) {
                    metaElementIsBeforeRequiredElements = false;
                }
            }

            // * it's specified in the `<body>`.

            const bodyMetaElements: Array<IAsyncHTMLElement> = getXUACompatibleMetaElements(await pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(XUACompatibleMetaElement)) {
                await context.report(resource, XUACompatibleMetaElement, `'x-ua-compatible' meta element should be specified in the '<head>', not '<body>'.`);

                return;
            }

            // All other meta elements should not be included.

            if (XUACompatibleMetaElements.length > 1) {
                const metaElements = XUACompatibleMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    await context.report(resource, metaElement, `'x-ua-compatible' meta element is not needed as one was already specified.`);
                }
            }
        };

        const loadHintConfigs = () => {
            requireMetaElement = (context.hintOptions && context.hintOptions.requireMetaElement) || false;

            /*
             * Document modes are only supported by Internet Explorer 8/9/10.
             * https://msdn.microsoft.com/en-us/library/jj676915.aspx
             */

            suggestRemoval = [
                'ie 8',
                'ie 9',
                'ie 10'
            ].every((e) => {
                return !context.targetedBrowsers.includes(e);
            });
        };

        const validate = async (event: TraverseEnd) => {
            const { resource }: { resource: string } = event;

            // The following check doesn't make sense for local files.

            if (!isLocalFile(resource)) {
                checkHeader(resource, context.pageHeaders);
            }

            await checkMetaElement(resource);
        };

        loadHintConfigs();

        context.on('traverse::end', validate);
    }
}
