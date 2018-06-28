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

import { Category } from 'hint/dist/src/lib/enums/category';
/* eslint-disable no-unused-vars */
import {
    ElementFound,
    IAsyncHTMLDocument,
    IAsyncHTMLElement,
    IRule,
    RuleMetadata,
    TraverseEnd
} from 'hint/dist/src/lib/types';
/* eslint-enable no-unused-vars */
import { isSupported } from 'hint/dist/src/lib/utils/caniuse';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { RuleContext } from 'hint/dist/src/lib/rule-context';
import { RuleScope } from 'hint/dist/src/lib/enums/rulescope';

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

        const targetedBrowsers: string = context.targetedBrowsers.join();

        let bodyElementWasReached: boolean = false;
        let firstThemeColorMetaTag: IAsyncHTMLElement;

        const checkIfThemeColorMetaTagWasSpecified = async (event: TraverseEnd) => {
            const { resource } = event;

            if (!firstThemeColorMetaTag) {
                await context.report(resource, null, `No 'theme-color' meta tag was specified`);
            }
        };

        const isNotSupportedColorValue = (color, normalizedColorValue: string): boolean => {
            const hexWithAlphaRegex = /^#([0-9a-fA-F]{4}){1,2}$/;

            /*
             * `theme-color` can accept any CSS `<color>`:
             *
             *   * https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
             *   * https://drafts.csswg.org/css-color/#typedef-color
             *
             *  However, `HWB` and `hex with alpha` values are not
             *  supported everywhere `theme-color` is. Also, values
             *  such as `currentcolor` don't make sense, but they
             *  will be catched by the above check.
             *
             *  See also:
             *
             *   * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Browser_compatibility
             *   * https://cs.chromium.org/chromium/src/third_party/WebKit/Source/platform/graphics/Color.cpp?rcl=6263bcf0ec9f112b5f0d84fc059c759302bd8c67
             */

            // `RGBA` support depends on the browser.
            return (color.model === 'rgb' &&
                hexWithAlphaRegex.test(normalizedColorValue) &&
                !isSupported('css-rrggbbaa', targetedBrowsers)) ||

                // `HWB` is not supported anywhere (?).
                color.model === 'hwb';
        };

        const checkContentAttributeValue = async (resource: string, element: IAsyncHTMLElement) => {
            const contentValue = element.getAttribute('content');
            const normalizedContentValue = normalizeString(contentValue, '');
            const color = parseColor(normalizedContentValue);

            if (color === null) {
                await context.report(resource, element, `'content' attribute value ('${contentValue}') is invalid`);

                return;
            }

            if (isNotSupportedColorValue(color, normalizedContentValue)) {
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
