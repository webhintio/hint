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
import { HintContext } from 'hint/dist/src/lib/hint-context';

import { HTMLEvents } from '@hint/parser-html';
import { normalizeString } from '@hint/utils-string';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

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

            if (document.isFragment) {
                return;
            }

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
                context.report(
                    resource,
                    getMessage('metaElementNotSpecified', context.language),
                    { severity: Severity.warning }
                );

                return;
            }

            /*
             * Treat the first charset meta element as the one
             * the user intended to use, and check if it's:
             */

            const charsetMetaElement = charsetMetaElements[0];

            // * `<meta charset="utf-8">`

            if (charsetMetaElement.getAttribute('http-equiv') !== null) {
                context.report(
                    resource,
                    getMessage('metaElementShorter', context.language),
                    {
                        element: charsetMetaElement,
                        severity: Severity.warning
                    });
            } else {
                const metaValue = normalizeString(charsetMetaElement.getAttribute('charset'));

                if (metaValue !== 'utf-8') {

                    const severity = metaValue === 'utf8' ?
                        Severity.warning :
                        Severity.error;

                    context.report(
                        resource,
                        getMessage('metaElementWrongValue', context.language),
                        {
                            element: charsetMetaElement,
                            severity
                        });
                }
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

                const severity = (firstHeadElement.getLocation().endOffset || 0) <= 1024 ?
                    Severity.hint :
                    Severity.error;

                context.report(
                    resource,
                    getMessage('metaElementFirstThing', context.language),
                    {
                        element: charsetMetaElement,
                        severity
                    });
            }

            // * specified in the `<body>`.

            const bodyMetaElements = document.querySelectorAll('body meta[charset], body meta[http-equiv="content-type" i]');

            if (bodyMetaElements[0] && bodyMetaElements[0].isSame(charsetMetaElement)) {
                context.report(
                    resource,
                    getMessage('metaElementInBody', context.language),
                    {
                        element: charsetMetaElement,
                        severity: Severity.error
                    });

                return;
            }

            // All other charset meta elements should not be included.

            if (charsetMetaElements.length > 1) {
                const metaElements = charsetMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    context.report(
                        resource,
                        getMessage('metaElementDuplicated', context.language),
                        {
                            element: metaElement,
                            severity: Severity.warning
                        }
                    );
                }
            }
        });
    }
}
