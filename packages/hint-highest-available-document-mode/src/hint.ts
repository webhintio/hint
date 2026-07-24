/**
 * @fileoverview Check if browsers that support document modes are
 * informed to use the highest on available.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { HttpHeaders } from '@hint/utils-types';
import { normalizeString } from '@hint/utils-string';
import { isLocalFile } from '@hint/utils-network';
import { HTMLDocument, HTMLElement } from '@hint/utils-dom';
import { IHint, TraverseEnd } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

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
                    context.report(
                        resource,
                        getMessage('responseShouldInclude', context.language),
                        { severity: Severity.hint });
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
                context.report(
                    resource,
                    getMessage('responseUnneeded', context.language),
                    {
                        codeLanguage,
                        codeSnippet,
                        severity: Severity.hint
                    });

                return;
            }

            if (headerValue?.trim().toLowerCase() !== 'ie=edge') {
                context.report(
                    resource,
                    getMessage('headerValueShouldBe', context.language),
                    {
                        codeLanguage,
                        codeSnippet,
                        severity: Severity.error
                    });
            }

            /*
             * Note: The check if the X-UA-Compatible HTTP response
             *       header is sent for non-HTML documents is covered
             *       by the `no-html-only-headers` hint.
             */

        };

        const checkMetaElement = (resource: string) => {

            const pageDOM: HTMLDocument = context.pageDOM as HTMLDocument;
            const XUACompatibleMetaElements: HTMLElement[] = pageDOM.querySelectorAll('meta[http-equiv=x-ua-compatible i]');

            /*
             * By default, if the user did not request the meta
             * element to be specified, prefer the HTTP response
             * header over using the meta element, as the meta
             * element will not always work.
             */

            if (!requireMetaElement || suggestRemoval) {
                if (XUACompatibleMetaElements.length !== 0) {

                    const errorMessage = suggestRemoval ?
                        getMessage('metaElementShouldNotBeSpecified', context.language) :
                        getMessage('metaElementShouldNotBeSpecifiedUseHeader', context.language);

                    for (const metaElement of XUACompatibleMetaElements) {
                        context.report(
                            resource,
                            errorMessage,
                            {
                                element: metaElement,
                                severity: Severity.hint
                            });
                    }
                }

                return;
            }

            // If the user requested the meta element to be specified.

            if (XUACompatibleMetaElements.length === 0) {
                context.report(
                    resource,
                    getMessage('metaElementShouldBeSpecified', context.language),
                    { severity: Severity.error }
                );

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
                const message = getMessage('metaElementValueShouldBe', context.language);

                context.report(
                    resource,
                    message,
                    {
                        element: XUACompatibleMetaElement,
                        severity: Severity.error
                    });
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
                        const message = getMessage('metaElementWrongPosition', context.language);

                        context.report(
                            resource,
                            message,
                            {
                                element: XUACompatibleMetaElement,
                                severity: Severity.error
                            });
                    }

                    break;
                }

                if (!['title', 'meta'].includes(headElement.nodeName.toLowerCase())) {
                    metaElementIsBeforeRequiredElements = false;
                }
            }

            // * it's specified in the `<body>`.

            const bodyMetaElements: HTMLElement[] = pageDOM.querySelectorAll('body meta[http-equiv=x-ua-compatible i]');

            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(XUACompatibleMetaElement)) {
                const message = getMessage('metaElementNotBody', context.language);

                context.report(
                    resource,
                    message,
                    {
                        element: XUACompatibleMetaElement,
                        severity: Severity.error
                    });

                return;
            }

            // All other meta elements should not be included.

            if (XUACompatibleMetaElements.length > 1) {
                const metaElements = XUACompatibleMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    const message = getMessage('metaElementDuplicated', context.language);

                    context.report(
                        resource,
                        message,
                        {
                            element: metaElement,
                            severity: Severity.warning
                        });
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
