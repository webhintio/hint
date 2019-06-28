/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

/*
 * ---------------------------------------------------------------------
 * Requirements
 * ---------------------------------------------------------------------
 */

import { parse as bcp47 } from 'bcp47';
import { get as parseColor, ColorDescriptor } from 'color-string';

import {
    IHint,
    IJSONLocationFunction
} from 'hint/dist/src/lib/types';
import { isSupported } from '@hint/utils/dist/src/compat';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import {
    Manifest,
    ManifestEvents,
    ManifestInvalidJSON,
    ManifestInvalidSchema,
    ManifestParsed
} from '@hint/parser-manifest';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ---------------------------------------------------------------------
 * Public
 * ---------------------------------------------------------------------
 */

export default class ManifestIsValidHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ManifestEvents>) {

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

        const checkColors = (resource: string, manifest: Manifest, getLocation: IJSONLocationFunction) => {
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
                    const location = getLocation(property);
                    const message = getMessage('invalidValue', context.language, [colorValue, property]);

                    context.report(resource, message, { location });

                    continue;
                }

                if (isNotSupportedColorValue(color, normalizedColorValue)) {
                    const location = getLocation(property);
                    const message = getMessage('unsupportedValue', context.language, [colorValue, property]);

                    context.report(resource, message, { location });
                }
            }
        };

        const checkLang = (resource: string, manifest: Manifest, getLocation: IJSONLocationFunction) => {
            const lang = manifest.lang;

            if (lang && !bcp47(lang)) {
                const location = getLocation('lang');
                const message = getMessage('invalidValue', context.language, [lang, 'lang']);

                context.report(resource, message, { location });
            }
        };

        const handleInvalidJSON = (manifestInvalidJSON: ManifestInvalidJSON) => {
            const { resource } = manifestInvalidJSON;

            context.report(resource, getMessage('validJSON', context.language));
        };

        const handleInvalidSchema = (manifestInvalidSchemaEvent: ManifestInvalidSchema) => {
            for (let i = 0; i < manifestInvalidSchemaEvent.groupedErrors.length; i++) {
                const error = manifestInvalidSchemaEvent.groupedErrors[i].message;
                const location = manifestInvalidSchemaEvent.groupedErrors[i].location;

                context.report(manifestInvalidSchemaEvent.resource, error, { location });
            }
        };

        const validateOtherProperties = (manifestParsed: ManifestParsed) => {
            const {
                getLocation,
                parsedContent: manifest,
                resource
            } = manifestParsed;

            // Additional checks not covered by the schema.
            checkLang(resource, manifest, getLocation);
            checkColors(resource, manifest, getLocation);
        };

        context.on('parse::end::manifest', validateOtherProperties);
        context.on('parse::error::manifest::json', handleInvalidJSON);
        context.on('parse::error::manifest::schema', handleInvalidSchema);
    }
}
