/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

/*
 * ---------------------------------------------------------------------
 * Requirements
 * ---------------------------------------------------------------------
 */

import { parse as bcp47 } from 'bcp47';
import { get as parseColor } from 'color-string';

import { Category } from 'hint/dist/src/lib/enums/category';
import {
    IAsyncHTMLElement,
    IHint,
    HintMetadata
} from 'hint/dist/src/lib/types';
import { isSupported } from 'hint/dist/src/lib/utils/caniuse';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import {
    Manifest,
    ManifestInvalidJSON,
    ManifestInvalidSchema,
    ManifestParsed
} from '@hint/parser-manifest/dist/src/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ---------------------------------------------------------------------
 * Public
 * ---------------------------------------------------------------------
 */

export default class ManifestIsValidHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require valid web app manifest'
        },
        id: 'manifest-is-valid',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const targetedBrowsers: string = context.targetedBrowsers.join();

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

        const checkColors = async (resource: string, element: IAsyncHTMLElement, manifest: Manifest) => {
            const colorProperties = [
                'background_color',
                'theme_color'
            ];

            for (const property of colorProperties) {
                const colorValue = manifest[property];
                const normalizedColorValue = normalizeString(colorValue, '');

                if (!normalizedColorValue) {
                    continue;
                }

                const color = parseColor(normalizedColorValue);

                if (color === null) {
                    await context.report(resource, element, `Web app manifest should not have invalid value '${colorValue}' for property '${property}'.`);

                    continue;
                }

                if (isNotSupportedColorValue(color, normalizedColorValue)) {
                    await context.report(resource, element, `Web app manifest should not have unsupported value '${colorValue}' for property '${property}'.`);
                }
            }
        };

        const checkLang = async (resource: string, element: IAsyncHTMLElement, manifest: Manifest) => {
            const lang = manifest.lang;

            if (lang && !bcp47(lang)) {
                await context.report(resource, element, `Web app manifest should not have invalid value '${manifest.lang}' for property 'lang'.`);
            }
        };

        const handleInvalidJSON = async (manifestInvalidJSON: ManifestInvalidJSON) => {
            const { resource, element } = manifestInvalidJSON;

            await context.report(resource, element, `Web app manifest should contain valid JSON.`);
        };

        const handleInvalidSchema = async (manifestInvalidSchemaEvent: ManifestInvalidSchema) => {
            for (const error of manifestInvalidSchemaEvent.prettifiedErrors) {
                await context.report(manifestInvalidSchemaEvent.resource, manifestInvalidSchemaEvent.element, error);
            }
        };

        const validateOtherProperties = async (manifestParsed: ManifestParsed) => {
            const {
                element,
                parsedContent: manifest,
                resource
            }: { element: IAsyncHTMLElement, parsedContent: Manifest, resource: string } = manifestParsed;

            // Additional checks not covered by the schema.
            await checkLang(resource, element, manifest);
            await checkColors(resource, element, manifest);
        };

        context.on('parse::manifest::end', validateOtherProperties);
        context.on('parse::manifest::error::json', handleInvalidJSON);
        context.on('parse::manifest::error::schema', handleInvalidSchema);
    }
}
