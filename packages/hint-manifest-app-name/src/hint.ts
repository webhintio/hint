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
import { IHint, HintMetadata, IJSONLocationFunction } from 'hint/dist/src/lib/types';
import { Manifest, ManifestParsed } from '@hint/parser-manifest/dist/src/types';
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

        const checkIfPropertyExists = async (resource: string, content: string | undefined, propertyName: string) => {
            if (typeof content === 'undefined') {
                await context.report(resource, null, `Web app manifest should have '${propertyName}' property.`);
            }
        };

        const checkIfPropertyValueIsNotEmpty = async (resource: string, content: string | undefined, propertyName: string, getLocation: IJSONLocationFunction) => {
            if (typeof content === 'string' && (content.trim() === '')) {
                await context.report(resource, null, `Web app manifest should have non-empty '${propertyName}' property value.`, undefined, getLocation(propertyName) || undefined);
            }
        };

        const checkIfPropertyValueIsUnderLimit = async (resource: string, content: string | undefined, propertyName: string, shortNameLengthLimit: number, getLocation: IJSONLocationFunction) => {
            if (content && (ucs2.decode(content).length > shortNameLengthLimit)) {
                await context.report(resource, null, `Web app manifest should have '${propertyName}' property value under ${shortNameLengthLimit} characters.`, undefined, getLocation(propertyName) || undefined);

                return false;
            }

            return true;
        };

        const validate = async (manifestParsed: ManifestParsed) => {
            const { getLocation, parsedContent: manifest, resource }: { getLocation: IJSONLocationFunction, parsedContent: Manifest, resource: string } = manifestParsed;

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
             *  https://github.com/webhintio/hint/issues/136
             *
             *  Note: This is also consistent with what the Chrome team
             *  used to, and still recommends.
             *
             *  https://developer.chrome.com/apps/manifest/name#short_name
             */

            const shortNameLengthLimit: number = 12;

            await checkIfPropertyExists(resource, name, 'name');
            await checkIfPropertyValueIsNotEmpty(resource, name, 'name', getLocation);
            await checkIfPropertyValueIsUnderLimit(resource, name, 'name', nameLengthLimit, getLocation);

            const shortName: string | undefined = manifest.short_name;
            const shortNameIsRequired: boolean | undefined = typeof name === 'string' && (name.trim() !== '') && (ucs2.decode(name).length > shortNameLengthLimit);

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
            await checkIfPropertyValueIsNotEmpty(resource, shortName, 'short_name', getLocation);
            await checkIfPropertyValueIsUnderLimit(resource, shortName, 'short_name', shortNameLengthLimit, getLocation);
        };

        context.on('parse::manifest::end', validate);
    }
}
