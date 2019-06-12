/**
 * @fileoverview Check if browsers that support document modes are
 * informed to use the highest on available.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { HttpHeaders } from '@hint/utils/dist/src/types/http-header';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { isLocalFile } from '@hint/utils/dist/src/network/is-local-file';
import { HTMLDocument, HTMLElement } from '@hint/utils/dist/src/dom/html';
import { IHint, TraverseEnd } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HighestAvailableDocumentModeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let requireMetaElement: boolean = false;
        let suggestRemoval: boolean = false;

        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getXUACompatibleMetaElements = (elements: HTMLElement[]): HTMLElement[] => {
            return elements.filter((element: HTMLElement) => {
                return (element.getAttribute('http-equiv') !== null &&
                    normalizeString(element.getAttribute('http-equiv')) === 'x-ua-compatible');
            });
        };

        const checkHeader = (resource: string, responseHeaders: HttpHeaders) => {
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
                    context.report(resource, `Response should include 'x-ua-compatible' header.`);
                }

                return;
            }

            const codeSnippet = `Content-Type: ${originalHeaderValue}`;
            const codeLanguage = 'http';
            /*
             * If the HTTP response header is included, but the targeted
             * browsers don't include the browser that support document
             * modes, suggest not sending the header.
             */

            if (suggestRemoval) {
                context.report(resource, `Response should not include unneeded 'x-ua-compatible' header.`, { codeLanguage, codeSnippet });

                return;
            }

            if (headerValue !== 'ie=edge') {
                context.report(resource, `'x-ua-compatible' header value should be 'ie=edge', not '${!originalHeaderValue ? '' : originalHeaderValue}'.`, { codeLanguage, codeSnippet });
            }

            /*
             * Note: The check if the X-UA-Compatible HTTP response
             *       header is sent for non-HTML documents is covered
             *       by the `no-html-only-headers` hint.
             */

        };

        const checkMetaElement = (resource: string) => {

            const pageDOM: HTMLDocument = context.pageDOM as HTMLDocument;
            const XUACompatibleMetaElements: HTMLElement[] = getXUACompatibleMetaElements(pageDOM.querySelectorAll('meta'));

            /*
             * By default, if the user did not request the meta
             * element to be specified, prefer the HTTP response
             * header over using the meta element, as the meta
             * element will not always work.
             */

            if (!requireMetaElement || suggestRemoval) {
                if (XUACompatibleMetaElements.length !== 0) {

                    const errorMessage = suggestRemoval ?
                        `'x-ua-compatible' meta element should not be specified as it is not needed.` :
                        `'x-ua-compatible' meta element should not be specified, and instead, equivalent HTTP header should be used.`;

                    for (const metaElement of XUACompatibleMetaElements) {
                        context.report(resource, errorMessage, { element: metaElement });
                    }
                }

                return;
            }

            // If the user requested the meta element to be specified.

            if (XUACompatibleMetaElements.length === 0) {
                context.report(resource, `'x-ua-compatible' meta element should be specified.`);

                return;
            }

            /*
             * Treat the first X-UA-Compatible meta element as
             * the one the user intended to use, and check if:
             */

            const XUACompatibleMetaElement: HTMLElement = XUACompatibleMetaElements[0];
            const contentValue: string | null = XUACompatibleMetaElement.getAttribute('content');

            // * it has the value `ie=edge`.

            if (normalizeString(contentValue) !== 'ie=edge') {
                const message = `'x-ua-compatible' meta element 'content' attribute value should be 'ie=edge', not '${!contentValue ? '' : contentValue}'.`;

                context.report(resource, message, { element: XUACompatibleMetaElement });
            }

            /*
             * * it's specified in the `<head>` before all
             *   other elements except for the `<title>` and
             *   other `<meta>` elements.
             *
             *   https://msdn.microsoft.com/en-us/library/jj676915.aspx
             */

            const headElements: HTMLElement[] = pageDOM.querySelectorAll('head *');
            let metaElementIsBeforeRequiredElements: boolean = true;

            for (const headElement of headElements) {
                if (headElement.isSame(XUACompatibleMetaElement)) {
                    if (!metaElementIsBeforeRequiredElements) {
                        const message = `'x-ua-compatible' meta element should be specified before all other elements except for '<title>' and other '<meta>' elements.`;

                        context.report(resource, message, { element: XUACompatibleMetaElement });
                    }

                    break;
                }

                if (!['title', 'meta'].includes(headElement.nodeName.toLowerCase())) {
                    metaElementIsBeforeRequiredElements = false;
                }
            }

            // * it's specified in the `<body>`.

            const bodyMetaElements: HTMLElement[] = getXUACompatibleMetaElements(pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(XUACompatibleMetaElement)) {
                const message = `'x-ua-compatible' meta element should be specified in the '<head>', not '<body>'.`;

                context.report(resource, message, { element: XUACompatibleMetaElement });

                return;
            }

            // All other meta elements should not be included.

            if (XUACompatibleMetaElements.length > 1) {
                const metaElements = XUACompatibleMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    const message = `'x-ua-compatible' meta element is not needed as one was already specified.`;

                    context.report(resource, message, { element: metaElement });
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

        const validate = ({ resource }: TraverseEnd) => {
            // The following check doesn't make sense for local files.

            if (!isLocalFile(resource) && context.pageHeaders) {
                checkHeader(resource, context.pageHeaders);
            }

            checkMetaElement(resource);
        };

        loadHintConfigs();

        context.on('traverse::end', validate);
    }
}
