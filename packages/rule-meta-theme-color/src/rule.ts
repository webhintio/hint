/**
 * @fileoverview Check if a single `<meta name="theme-color">` is
 * specified in the `<head>`.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { get as parseColor } from 'color-string';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
/* eslint-disable no-unused-vars */
import {
    ElementFound,
    IAsyncHTMLDocument,
    IAsyncHTMLElement,
    IRule,
    RuleMetadata,
    TraverseEnd
} from 'sonarwhal/dist/src/lib/types';
/* eslint-enable no-unused-vars */
import {
    isHTMLDocument,
    normalizeString
} from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaThemeColorRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.pwa,
            description: `Require a 'theme-color' meta tag`
        },
        id: 'meta-theme-color',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        let bodyElementWasReached: boolean = false;
        let firstThemeColorMetaTag: IAsyncHTMLElement;

        const checkIfThemeColorMetaTagWasSpecified = async (event: TraverseEnd) => {
            const { resource } = event;

            /*
             * TODO: Remove this when `traverse::end` is
             * not emited for non-html documents.
             *
             * https://github.com/sonarwhal/sonarwhal/issues/982
             */

            if (!isHTMLDocument(resource, context.pageHeaders)) {
                return;
            }

            if (!firstThemeColorMetaTag) {
                await context.report(resource, null, `No 'theme-color' meta tag was specified`);
            }
        };

        const checkContentAttributeValue = async (resource: string, element: IAsyncHTMLElement) => {
            const contentValue = element.getAttribute('content');
            const normalizedContentValue = normalizeString(contentValue, '');
            const color = parseColor(normalizedContentValue);

            if (color === null) {
                await context.report(resource, element, `'content' attribute value ('${contentValue}') is invalid`);

                return;
            }

            /*
             * `theme-color` can accept any CSS `<color>`:
             *
             *    * https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
             *    * https://drafts.csswg.org/css-color/#typedef-color
             *
             *  However:
             *
             *    * Values such as `hwb` and `hex with alpha` are not
             *      supported everywhere `theme-color` is.
             *
             *    * `rgba` and `hsla` even if supported, browsers ignore
             *      the alpha.
             *
             *    * Windows/Microsoft Store require the color value to
             *      be specified either as `hex` or as a color name.
             *
             *  Also, some values such as `currentcolor` don't make
             *  sense, but they will be catched by the previous check.
             *
             *  See also:
             *
             *    * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Browser_compatibility
             *    * https://cs.chromium.org/chromium/src/third_party/WebKit/Source/platform/graphics/Color.cpp?rcl=6263bcf0ec9f112b5f0d84fc059c759302bd8c67
             */

            const hexWithoutAlphaRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
            const colorNameRegex = /^[a-zA-Z]+$/;

            if (!hexWithoutAlphaRegex.test(normalizedContentValue) &&
                !colorNameRegex.test(normalizedContentValue)
            ) {
                await context.report(resource, element, `'content' attribute value ('${contentValue}') is not supported everywhere`);
            }
        };

        const checkNameAttributeValue = async (resource: string, element: IAsyncHTMLElement) => {
            /*
             *  Something such as `name=" theme-color"` is not valid,
             *  but if used, the user probably wanted `name="theme-color"`.
             *
             *  From: https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
             *
             *  " The element has a name attribute, whose value is
             *    an ASCII case-insensitive match for `theme-color` "
             */

            const nameAttributeValue = element.getAttribute('name');

            if (nameAttributeValue && nameAttributeValue !== nameAttributeValue.trim()) {
                await context.report(resource, element, `'name' attribute needs to be 'theme-color' (not '${nameAttributeValue}')`);
            }
        };

        const validate = async (event: ElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = event;

            // Check if it's a `theme-color` meta tag.

            if (normalizeString(element.getAttribute('name')) !== 'theme-color') {
                return;
            }

            /*
             * Check if a `theme-color` meta tag was already specified.
             *
             * From  https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
             *
             *  " There must not be more than one meta element with its
             *    name attribute value set to an ASCII case-insensitive
             *    match for theme-color per document. "
             */

            if (firstThemeColorMetaTag) {
                await context.report(resource, element, `A 'theme-color' meta tag was already specified`);

                return;
            }

            firstThemeColorMetaTag = element;

            // Check if the `theme-color` meta tag:

            //  * was specified in the `<body>`

            if (bodyElementWasReached) {
                await context.report(resource, element, `Should not be specified in the '<body>'`);

                return;
            }

            //  * has a valid `name` attribute value

            await checkNameAttributeValue(resource, element);

            //  * has a valid color value that is also supported

            await checkContentAttributeValue(resource, element);
        };

        context.on('element::meta', validate);
        context.on('element::body', () => {
            bodyElementWasReached = true;
        });
        context.on('traverse::end', checkIfThemeColorMetaTagWasSpecified);
    }
}
