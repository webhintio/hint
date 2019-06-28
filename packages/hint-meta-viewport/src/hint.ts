/**
 * @fileoverview Check if the viewport meta element is specified in the
 * `<head>` with the proper value.
 */

import { parseMetaViewPortContent } from 'metaviewport-parser';

import { HTMLElement, HTMLDocument } from '@hint/utils/dist/src/dom/html';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { TraverseEnd } from 'hint/dist/src/lib/types';
import { IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaViewportHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getViewportMetaElements = (elements: HTMLElement[]): HTMLElement[] => {
            return elements.filter((element) => {
                return (element.getAttribute('name') !== null && normalizeString(element.getAttribute('name')) === 'viewport');
            });
        };

        const listIncludesBrowsersWithOrientationChangeBug = (browsersList: string[]): boolean => {

            /*
             * Old versions of Safari for iOS require `initial-scale=1`
             * in order to react on orientation change.
             *
             *  * https://www.quirksmode.org/blog/archives/2013/10/initialscale1_m.html
             *  * https://www.quirksmode.org/blog/archives/2013/10/more_about_scal.html
             *  * https://www.quirksmode.org/mobile/metaviewport/quickdevicewidth.html
             *
             * As of Safari for iOS 9+, that is no longer the case.
             *
             *  * https://twitter.com/ppk/status/829329905942986752
             */

            return browsersList.some((browserVersion) => {

                /*
                 * The following is done because `browsersList` returns
                 * values such as: 'ios_saf 10.3', 'ios_saf 10.0-10.2'.
                 */

                const version = (/ios_saf (\d+)\.?.*/).exec(browserVersion);

                return version ? parseInt(version[1]) < 9 : false;
            });
        };

        const checkContentValue = (contentValue: string | null, resource: string, viewportMetaElement: HTMLElement) => {

            if (!contentValue) {
                const message = getMessage('metaElementNonEmptyContent', context.language);

                context.report(resource, message, { element: viewportMetaElement });

                return;
            }

            const content = parseMetaViewPortContent(contentValue);

            // Check for unknown properties and invalid values.

            for (const key of Object.keys(content.unknownProperties)) {
                const message = getMessage('metaElementUnknownProperty', context.language, key);

                context.report(resource, message, { element: viewportMetaElement });
            }

            for (const key of Object.keys(content.invalidValues)) {
                const message = getMessage('metaElementInvalidValues', context.language, [content.invalidValues[key].toString(), key]);

                context.report(resource, message, { element: viewportMetaElement });
            }

            // Disallow certain properties.

            for (const key of Object.keys(content.validProperties)) {

                /*
                 * The following properties allow to block the user
                 * from zooming, behavior that most of the time results
                 * in accessibility problems or annoying users.
                 *
                 * Because of that, they are now ignored by browsers
                 * such as Safari for iOS 10+.
                 *
                 * https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/
                 */

                if ([
                    'maximum-scale',
                    'minimum-scale',
                    'user-scalable'
                ].includes(key)) {
                    const message = getMessage('metaElementDisallowedValues', context.language, key);

                    context.report(resource, message, { element: viewportMetaElement });
                }
            }

            /*
             * Require `width=device-width`.
             *
             * https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/
             * https://developers.google.com/web/updates/2013/12/300ms-tap-delay-gone-away
             */

            if (content.validProperties.width !== 'device-width') {
                const message = getMessage('metaElementNoDeviceWidth', context.language);

                context.report(resource, message, { element: viewportMetaElement });
            }

            const initialScaleValue = content.validProperties['initial-scale'];

            /*
             * Require  `initial-scale=1`.
             *
             * If specified, require `initial-scale` to have the value
             * of `1` or `1.0` (Note: `metaviewport-parser` normalizes
             * `1.0` to `1`).
             *
             * If not specified, also require `initial-scale=1` if the
             * targeted browsers include versions of Safari for iOS that
             * include the orientation change bug.
             * Note:
             *
             *  The `initialScaleValue !== 'undefined'` condition is
             *  included in order to know that `initial-scale` property
             *  was not specified at all.
             *
             *  If it is specified with an invalid value, `metaviewport-parser`
             *  will included it both under `validProperties` with a value
             *  of `null`, and `invalidValues`.
             */

            if ((initialScaleValue !== 1 && typeof initialScaleValue !== 'undefined') ||
                (typeof initialScaleValue === 'undefined' && listIncludesBrowsersWithOrientationChangeBug(context.targetedBrowsers))) {

                const message = getMessage('metaElementNoInitialScale', context.language);

                context.report(resource, message, { element: viewportMetaElement });
            }
        };

        const validate = ({ resource }: TraverseEnd) => {
            const pageDOM: HTMLDocument = context.pageDOM as HTMLDocument;
            const viewportMetaElements: HTMLElement[] = getViewportMetaElements(pageDOM.querySelectorAll('meta'));

            if (viewportMetaElements.length === 0) {
                context.report(resource, getMessage('metaElementNotSpecified', context.language));

                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * Treat the first viewport meta element as the one the user
             * intended to use, and check if it's specified in the `<body>`.
             */

            const viewportMetaElement: HTMLElement = viewportMetaElements[0];
            const bodyMetaElements: HTMLElement[] = getViewportMetaElements(pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(viewportMetaElement)) {
                context.report(resource, getMessage('metaElementInBody', context.language), { element: viewportMetaElement });
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * Check if the meta element was specified with the proper value.
             */

            const contentValue = normalizeString(viewportMetaElement.getAttribute('content'));

            checkContentValue(contentValue, resource, viewportMetaElement);

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * All other viewport meta elements should not be included.
             */

            if (viewportMetaElements.length > 1) {
                const metaElements = viewportMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    context.report(resource, getMessage('metaElementDuplicated', context.language), { element: metaElement });
                }
            }

        };

        context.on('traverse::end', validate);
    }
}
