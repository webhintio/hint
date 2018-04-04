/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

/*
 * ---------------------------------------------------------------------
 * Requirements
 * ---------------------------------------------------------------------
 */

import { isSupported } from 'caniuse-api';
import { parse as bcp47 } from 'bcp47';
import { get as parseColor } from 'color-string';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import {
    IAsyncHTMLElement,
    IRule,
    RuleMetadata
} from 'sonarwhal/dist/src/lib/types';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import {
    Manifest,
    ManifestInvalidJSON,
    ManifestInvalidSchema,
    ManifestParsed
} from '@sonarwhal/parser-manifest/dist/src/types';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

/*
 * ---------------------------------------------------------------------
 * Public
 * ---------------------------------------------------------------------
 */

export default class ManifestIsValidRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require valid web app manifest'
        },
        id: 'manifest-is-valid',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        const checkColors = async (resource: string, element: IAsyncHTMLElement, manifest: Manifest) => {
            const colorProperties = [
                'background_color',
                'theme_color'
            ];

            const targetedBrowsers: string = context.targetedBrowsers.join();
            const hexWithAlphaIsSupported = targetedBrowsers && isSupported('css-rrggbbaa', targetedBrowsers);
            const hexWithAlphaRegex = /^#([0-9a-fA-F]{4}){1,2}$/;

            for (const property of colorProperties) {
                const colorValue = manifest[property];
                const normalizedColorValue = normalizeString(colorValue, '');

                if (!normalizedColorValue) {
                    continue;
                }

                const color = parseColor(normalizedColorValue);

                if (color === null) {
                    await context.report(resource, element, `'${property}' property value ('${colorValue}') is invalid`);

                    continue;
                }

                /*
                 * Some of the manifest's properties can accept any
                 * CSS `<color>`, however, not all forms of specifying
                 * color are supported everywhere. Also, values such as
                 * `currentcolor` don't make sense, but they will be
                 * catched by the above check.
                 */

                if (
                    // `HWB` is not supported anywhere (?).
                    color.model === 'hwb' ||

                    // `RGBA` support depends on the browser.
                    (color.model === 'rgb' &&
                        hexWithAlphaRegex.test(normalizedColorValue) &&
                        !hexWithAlphaIsSupported)
                ) {
                    await context.report(resource, element, `'${property}' property value ('${colorValue}') is not supported`);
                }
            }
        };

        const checkLang = async (resource: string, element: IAsyncHTMLElement, manifest: Manifest) => {
            const lang = manifest.lang;

            if (lang && !bcp47(lang)) {
                await context.report(resource, element, `'lang' property value ('${manifest.lang}') is not a valid language tag`);
            }
        };

        const handleInvalidJSON = async (manifestInvalidJSON: ManifestInvalidJSON) => {
            const { resource, element } = manifestInvalidJSON;

            await context.report(resource, element, `Should contain valid JSON`);
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
