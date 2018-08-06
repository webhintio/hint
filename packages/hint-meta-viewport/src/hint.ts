/**
 * @fileoverview Check if the viewport meta element is specified in the
 * `<head>` with the proper value.
 */

import { parseMetaViewPortContent } from 'metaviewport-parser';

import { Category } from 'hint/dist/src/lib/enums/category';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { IAsyncHTMLDocument, IAsyncHTMLElement, TraverseEnd, HintMetadata } from 'hint/dist/src/lib/types';
import { IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaViewportHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: 'Require viewport meta element'
        },
        id: 'meta-viewport',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getViewportMetaElements = (elements: Array<IAsyncHTMLElement>): Array<IAsyncHTMLElement> => {
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

        const checkContentValue = async (contentValue: string | null, resource: string, viewportMetaElement: IAsyncHTMLElement) => {

            if (!contentValue) {
                await context.report(resource, viewportMetaElement, `'viewport' meta element should have non-empty 'content' attribute.`);

                return;
            }

            const content = parseMetaViewPortContent(contentValue);

            // Check for unknown properties and invalid values.

            for (const key of Object.keys(content.unknownProperties)) {
                await context.report(resource, viewportMetaElement, `'viewport' meta element 'content' attribute value should not contain unknown property '${key}'.`);
            }

            for (const key of Object.keys(content.invalidValues)) {
                await context.report(resource, viewportMetaElement, `'viewport' meta element 'content' attribute value should not contain invalid value '${content.invalidValues[key]}' for property '${key}'.`);
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
                    await context.report(resource, viewportMetaElement, `'viewport' meta element 'content' attribute value should not contain disallowed property '${key}'.`);
                }
            }

            /*
             * Require `width=device-width`.
             *
             * https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/
             * https://developers.google.com/web/updates/2013/12/300ms-tap-delay-gone-away
             */

            if (content.validProperties.width !== 'device-width') {
                await context.report(resource, viewportMetaElement, `'viewport' meta element 'content' attribute value should contain 'width=device-width'.`);
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
                await context.report(resource, viewportMetaElement, `'viewport' meta element 'content' attribute value should contain 'initial-scale=1'.`);
            }
        };

        const validate = async (event: TraverseEnd) => {

            const { resource }: { resource: string } = event;
            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const viewportMetaElements: Array<IAsyncHTMLElement> = getViewportMetaElements(await pageDOM.querySelectorAll('meta'));

            if (viewportMetaElements.length === 0) {
                await context.report(resource, null, `'viewport' meta element was not specified.`);

                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * Treat the first viewport meta element as the one the user
             * intended to use, and check if it's specified in the `<body>`.
             */

            const viewportMetaElement: IAsyncHTMLElement = viewportMetaElements[0];
            const bodyMetaElements: Array<IAsyncHTMLElement> = getViewportMetaElements(await pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaElements.length > 0) && bodyMetaElements[0].isSame(viewportMetaElement)) {
                await context.report(resource, viewportMetaElement, `'viewport' meta element should be specified in the '<head>', not '<body>'.`);
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * Check if the meta element was specified with the proper value.
             */

            const contentValue = normalizeString(viewportMetaElement.getAttribute('content'));

            await checkContentValue(contentValue, resource, viewportMetaElement);

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            /*
             * All other viewport meta elements should not be included.
             */

            if (viewportMetaElements.length > 1) {
                const metaElements = viewportMetaElements.slice(1);

                for (const metaElement of metaElements) {
                    await context.report(resource, metaElement, `'viewport' meta element is not needed as one was already specified.`);
                }
            }

        };

        context.on('traverse::end', validate);
    }
}
