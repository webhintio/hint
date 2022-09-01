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
            const headElement = document.querySelectorAll('head')[0];

            if (charsetMetaElements.length === 0) {
                const fixes = [];
                const headElementLocation = headElement.getLocation();

                // if the headElement is not in the original document, the line, col will be set to -1
                if (headElementLocation.line !== -1) {
                    const text = headElement.prependChildOuterHtml('<meta charset="utf-8">');
                    const fix = {
                        location: headElement.getLocation(),
                        text
                    };

                    fixes.push(fix);
                } else {
                    const htmlElement = document.querySelectorAll('html')[0];
                    const htmlElementLocation = htmlElement.getLocation();

                    // No-op if there is no htmlElement. Another hint will prompt the user to create an html element.
                    if (htmlElementLocation.line !== -1) {
                        const text = htmlElement.prependChildOuterHtml('<head><meta charset="utf-8"></head>');
                        const fix = {
                            location: htmlElement.getLocation(),
                            text
                        };

                        fixes.push(fix);
                    }
                }

                context.report(
                    resource,
                    getMessage('metaElementNotSpecified', context.language),
                    {
                        fixes,
                        severity: Severity.warning
                    }
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
                        fixes: [
                            {
                                location: charsetMetaElement.getLocation(),
                                text: '<meta charset="utf-8">'
                            }
                        ],
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
                            fixes: [
                                {
                                    location: charsetMetaElement.getAttributeLocation('charset'),
                                    text: 'charset="utf-8"'
                                }
                            ],
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

            const prependMetaInHeadFix = {
                location: headElement.getLocation(),
                text: headElement.prependChildOuterHtml(charsetMetaElement.outerHTML, /* removeExistingInstance= */ true)
            };

            const removeMetaElementFix = {
                location: charsetMetaElement.getLocation(),
                text: ''
            };

            if (!isCharsetMetaFirstHeadElement || !isMetaElementFirstHeadContent) {
                const fixes = [prependMetaInHeadFix];
                let isMetaWithinHead = false;
                let checkParent = charsetMetaElement.parentElement;

                // Check if the meta element is within the head tag. If it is, prependMetaInHeadFix will handle the deletion.
                while (checkParent) {
                    if (headElement.isSame(checkParent)) {
                        isMetaWithinHead = true;
                        break;
                    }
                    checkParent = checkParent.parentElement;
                }

                // If the meta element is not in the head, we need to insert another fix to remove it.
                if (!isMetaWithinHead) {
                    fixes.unshift(removeMetaElementFix);
                }

                const severity = (firstHeadElement?.getLocation().endOffset || 0) <= 1024 ?
                    Severity.hint :
                    Severity.error;

                context.report(
                    resource,
                    getMessage('metaElementFirstThing', context.language),
                    {
                        element: charsetMetaElement,
                        fixes,
                        severity
                    });
            }

            // * specified in the `<body>`.

            const bodyMetaElements = document.querySelectorAll('body meta[charset], body meta[http-equiv="content-type" i]');

            if (bodyMetaElements[0] && bodyMetaElements[0].isSame(charsetMetaElement)) {
                const fixes = [
                    removeMetaElementFix,
                    prependMetaInHeadFix
                ];

                context.report(
                    resource,
                    getMessage('metaElementInBody', context.language),
                    {
                        element: charsetMetaElement,
                        fixes,
                        severity: Severity.error
                    });

                return;
            }

            // All other charset meta elements should not be included.

            if (charsetMetaElements.length > 1) {
                const metaElements = charsetMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    const fixes = [
                        {
                            location: metaElement.getLocation(),
                            text: ''
                        }
                    ];

                    context.report(
                        resource,
                        getMessage('metaElementDuplicated', context.language),
                        {
                            element: metaElement,
                            fixes,
                            severity: Severity.warning
                        }
                    );
                }
            }
        });
    }
}
