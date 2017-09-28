/**
 * @fileoverview Check if the viewport meta tag is specified in the
 * `<head>` with the proper value.
 */

import { parseMetaViewPortContent } from 'metaviewport-parser';

import { Category } from '../../enums/category';
import { isHTMLDocument, normalizeString } from '../../utils/misc';
import { IAsyncHTMLDocument, IAsyncHTMLElement, ITraverseEnd } from '../../types';
import { IRule, IRuleBuilder } from '../../types';
import { RuleContext } from '../../rule-context';

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        // This function exists because not all connector (e.g.: jsdom)
        // support matching attribute values case-insensitively.
        //
        // https://www.w3.org/TR/selectors4/#attribute-case

        const getViewportMetaTags = (elements: Array<IAsyncHTMLElement>): Array<IAsyncHTMLElement> => {
            return elements.filter((element) => {
                return (element.getAttribute('name') !== null && normalizeString(element.getAttribute('name')) === 'viewport');
            });
        };

        const listIncludesBrowsersWithOrientationChangeBug = (browsersList: string[]): boolean => {

            // Old versions of Safari for iOS require `initial-scale=1`
            // in order to react on orientation change.
            //
            //  * https://www.quirksmode.org/blog/archives/2013/10/initialscale1_m.html
            //  * https://www.quirksmode.org/blog/archives/2013/10/more_about_scal.html
            //  * https://www.quirksmode.org/mobile/metaviewport/quickdevicewidth.html
            //
            // As of Safari for iOS 9+, that is no longer the case.
            //
            //  * https://twitter.com/ppk/status/829329905942986752

            return browsersList.some((browserVersion) => {

                // The following is done because `browsersList` returns
                // values such as: 'ios_saf 10.3', 'ios_saf 10.0-10.2'.

                const version = (/ios_saf (\d+)\.?.*/).exec(browserVersion);

                return version ? parseInt(version[1]) < 9 : false;
            });
        };

        const checkContentValue = async (contentValue: string|null, resource: string, viewportMetaTag: IAsyncHTMLElement) => {

            if (!contentValue) {
                await context.report(resource, viewportMetaTag, `Meta tag should have non-empty 'content' attribute`);

                return;
            }

            const content = parseMetaViewPortContent(contentValue);

            // Check for unknown properties and invalid values.

            for (const key of Object.keys(content.unknownProperties)) {
                await context.report(resource, viewportMetaTag, `Meta tag has unknown property: '${key}'`);
            }

            for (const key of Object.keys(content.invalidValues)) {
                await context.report(resource, viewportMetaTag, `Meta tag has invalid value '${content.invalidValues[key]}' for property '${key}'`);
            }

            // Disallow certain properties.

            for (const key of Object.keys(content.validProperties)) {

                // The following properties allow to block the user
                // from zooming, behavior that most of the time results
                // in accessibility problems or just annoying users.
                //
                // Because of that, they are now ignored by browsers
                // such as Safari for iOS 10+.
                //
                // https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/

                if (['maximum-scale', 'minimum-scale', 'user-scalable'].includes(key)) {
                    await context.report(resource, viewportMetaTag, `Meta tag has disallowed property: '${key}'`);
                }
            }

            // Require `width=device-width`.
            //
            // https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/
            // https://developers.google.com/web/updates/2013/12/300ms-tap-delay-gone-away

            if (content.validProperties.width !== 'device-width') {
                await context.report(resource, viewportMetaTag, `Meta tag should have 'width=device-width'`);
            }

            const initialScaleValue = content.validProperties['initial-scale'];

            // Require  `initial-scale=1`.
            //
            // If specified, require `initial-scale` to have the value
            // of `1` or `1.0` (Note: `metaviewport-parser` normalizes
            // `1.0` to `1`).
            //
            // If not specified, also require `initial-scale=1` if the
            // targeted browsers include versions of Safari for iOS that
            // include the orientation change bug.

            // Note:
            //
            //  The `initialScaleValue !== 'undefined'` condition is
            //  included in order to know that `initial-scale` property
            //  was not specified at all.
            //
            //  If it is specified with an invalid value, `metaviewport-parser`
            //  will included it both under `validProperties` with a value
            //  of `null`, and `invalidValues`.

            if ((initialScaleValue !== 1 && typeof initialScaleValue !== 'undefined') ||
                (typeof initialScaleValue === 'undefined' && listIncludesBrowsersWithOrientationChangeBug(context.targetedBrowsers))) {
                await context.report(resource, viewportMetaTag, `Meta tag should have 'initial-scale=1'`);
            }
        };

        const validate = async (event: ITraverseEnd) => {

            const { resource }: { resource: string } = event;

            // The following checks don't make sense for non-HTML documents.

            if (!isHTMLDocument(resource, context.pageHeaders)) {
                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const viewportMetaTags: Array<IAsyncHTMLElement> = getViewportMetaTags(await pageDOM.querySelectorAll('meta'));

            if (viewportMetaTags.length === 0) {
                await context.report(resource, null, 'No viewport meta tag was specified');

                return;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            // Treat the first viewport meta tag as the one
            // the user intended to use, and check if it's
            // specified in the `<body>`.

            const viewportMetaTag: IAsyncHTMLElement = viewportMetaTags[0];
            const bodyMetaTags: Array<IAsyncHTMLElement> = getViewportMetaTags(await pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaTags.length > 0) && bodyMetaTags[0].isSame(viewportMetaTag)) {
                await context.report(resource, viewportMetaTag, `Meta tag should not be specified in the '<body>'`);
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            // Check if the meta tag was specified with the proper value.

            const contentValue = normalizeString(viewportMetaTag.getAttribute('content'));

            await checkContentValue(contentValue, resource, viewportMetaTag);

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            // All other viewport meta tags should not be included.

            if (viewportMetaTags.length > 1) {
                const metaTags = viewportMetaTags.slice(1);

                for (const metaTag of metaTags) {
                    await context.report(resource, metaTag, 'A viewport meta tag was already specified');
                }
            }

        };

        return { 'traverse::end': validate };
    },
    meta: {
        docs: {
            category: Category.interoperability,
            description: 'Require viewport meta tag'
        },
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
