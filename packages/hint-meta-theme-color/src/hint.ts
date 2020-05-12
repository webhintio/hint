/**
 * @fileoverview Check if a single `<meta name="theme-color">` is
 * specified in the `<head>`.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { get as parseColor, ColorDescriptor } from 'color-string';

import {
    ElementFound,
    HintContext,
    IHint,
    TraverseEnd
} from 'hint';
import { Severity } from '@hint/utils-types';
import { normalizeString } from '@hint/utils-string';
import { HTMLDocument, HTMLElement } from '@hint/utils-dom';
import { isSupported } from '@hint/utils-compat-data';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaThemeColorHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let bodyElementWasReached: boolean = false;
        let firstThemeColorMetaElement: HTMLElement;

        const checkIfThemeColorMetaElementWasSpecified = (event: TraverseEnd) => {
            const pageDOM = context.pageDOM as HTMLDocument;
            const { resource } = event;
            const linksToManifest = pageDOM.querySelectorAll('link[rel="manifest"]').length > 0;

            if (!firstThemeColorMetaElement && linksToManifest) {
                context.report(
                    resource,
                    getMessage('metaElementNotSpecified', context.language),
                    { severity: Severity.warning });
            }
        };

        const isNotSupportedColorValue = (color: ColorDescriptor, normalizedColorValue: string): boolean => {
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

            // TODO: Use `isSupported` for all color syntax checks.

            // `RGBA` support depends on the browser.
            return (color.model === 'rgb' &&
                hexWithAlphaRegex.test(normalizedColorValue) &&
                !isSupported({ property: 'color', value: '#00000000' }, context.targetedBrowsers)) ||

                // `HWB` is not supported anywhere (?).
                color.model === 'hwb';
        };

        const checkContentAttributeValue = (resource: string, element: HTMLElement) => {
            const contentValue = element.getAttribute('content')!;
            const normalizedContentValue = normalizeString(contentValue, '')!; // Will not be null because default was provided.
            const color = parseColor(normalizedContentValue);

            if (color === null) {
                const message = getMessage('metaElementInvalidContent', context.language);

                context.report(
                    resource,
                    message,
                    {
                        element,
                        severity: Severity.error
                    });

                return;
            }

            if (isNotSupportedColorValue(color, normalizedContentValue)) {
                const message = getMessage('metaElementUnsupported', context.language);

                context.report(
                    resource,
                    message,
                    {
                        element,
                        severity: Severity.error
                    });
            }
        };

        const checkNameAttributeValue = (resource: string, element: HTMLElement) => {
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
                const message = getMessage('metaElementInvalidName', context.language);

                context.report(
                    resource,
                    message,
                    {
                        element,
                        severity: Severity.warning
                    });
            }
        };

        const validate = ({ element, resource }: ElementFound) => {
            // Check if it's a `theme-color` meta element.

            if (normalizeString(element.getAttribute('name')) !== 'theme-color') {
                return;
            }

            /*
             * Check if a `theme-color` meta element was already specified.
             *
             * From  https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
             *
             *  " There must not be more than one meta element with its
             *    name attribute value set to an ASCII case-insensitive
             *    match for theme-color per document. "
             */

            if (firstThemeColorMetaElement) {
                context.report(
                    resource,
                    getMessage('metaElementDuplicated', context.language),
                    {
                        element,
                        severity: Severity.warning
                    });

                return;
            }

            firstThemeColorMetaElement = element;

            // Check if the `theme-color` meta element:

            //  * was specified in the `<body>`

            if (bodyElementWasReached) {
                context.report(
                    resource,
                    getMessage('metaElementInBody', context.language),
                    {
                        element,
                        severity: Severity.error
                    });

                return;
            }

            //  * has a valid `name` attribute value

            checkNameAttributeValue(resource, element);

            //  * has a valid color value that is also supported

            checkContentAttributeValue(resource, element);
        };

        context.on('element::meta', validate);
        context.on('element::body', () => {
            bodyElementWasReached = true;
        });
        context.on('traverse::end', checkIfThemeColorMetaElementWasSpecified);
    }
}
