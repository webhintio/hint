/**
 * @fileoverview Check if the web app manifest file includes the `name`
 * and `short_name` properties with appropriate values.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { ucs2 } from 'punycode';

import { Category } from 'hint/dist/src/lib/enums/category';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import {
    Manifest,
    ManifestParsed
} from '@hint/parser-manifest/dist/src/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestAppNameHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require web application name to be specified in the web app manifest file'
        },
        id: 'manifest-app-name',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const checkIfPropertyExists = async (resource: string, content: string, propertyName: string) => {
            if (typeof content === 'undefined') {
                await context.report(resource, null, `Should contain the '${propertyName}' property`);
            }
        };

        const checkIfPropertyValueIsNotEmpty = async (resource: string, content: string, propertyName: string) => {
            if (content && (content.trim() === '')) {
                await context.report(resource, null, `Should have non-empty '${propertyName}' property value`);
            }
        };

        const checkIfPropertyValueIsUnderLimit = async (resource: string, content: string, propertyName: string, shortNameLengthLimit: number) => {
            if (content && (ucs2.decode(content).length > shortNameLengthLimit)) {
                await context.report(resource, null, `Should have the '${propertyName}' property value under ${shortNameLengthLimit} characters`);

                return false;
            }

            return true;
        };

        const validate = async (manifestParsed: ManifestParsed) => {
            const { parsedContent: manifest, resource }: { parsedContent: Manifest, resource: string } = manifestParsed;

            const name = manifest.name;

            /*
             * The 30 character limit is used in order to be consistent
             * with the native OSes/app stores limits/recommendations.
             *
             * https://developer.apple.com/app-store/product-page/
             * https://support.google.com/googleplay/android-developer/answer/113469#store_listing
             */

            const nameLengthLimit: number = 30;

            /*
             * The 12 character limit is used to ensure that for most
             * cases the value won't be truncated. However depending
             * on other things such as:
             *
             *  * what font the user is using
             *  * what characters the web site/app name includes
             *    (e.g. `i` occupies less space then `W`)
             *
             *  the text may still be truncated even if it's under
             *  12 characters.
             *
             *  https://github.com/sonarwhal/sonarwhal/issues/136
             *
             *  Note: This is also consistent with what the Chrome team
             *  used to, and still recommends.
             *
             *  https://developer.chrome.com/apps/manifest/name#short_name
             */

            const shortNameLengthLimit: number = 12;

            await checkIfPropertyExists(resource, name, 'name');
            await checkIfPropertyValueIsNotEmpty(resource, name, 'name');
            await checkIfPropertyValueIsUnderLimit(resource, name, 'name', nameLengthLimit);

            const shortName: string = manifest.short_name;
            const shortNameIsRequired: boolean = name && (name.trim() !== '') && (ucs2.decode(name).length > shortNameLengthLimit);

            /*
             * Validate 'short_name' if:
             *
             *  * it's specified
             *  * if `name` is over the `short_name` length limit
             */

            if (!shortName && !shortNameIsRequired) {
                return;
            }

            await checkIfPropertyExists(resource, shortName, 'short_name');
            await checkIfPropertyValueIsNotEmpty(resource, shortName, 'short_name');
            await checkIfPropertyValueIsUnderLimit(resource, shortName, 'short_name', shortNameLengthLimit);
        };

        context.on('parse::manifest::end', validate);
    }
}
