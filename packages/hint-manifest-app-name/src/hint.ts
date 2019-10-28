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

import { IHint, IJSONLocationFunction } from 'hint/dist/src/lib/types';
import { ManifestEvents, ManifestParsed } from '@hint/parser-manifest';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestAppNameHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ManifestEvents>) {

        const checkIfPropertyExists = (resource: string, content: string | undefined, propertyName: string) => {
            if (typeof content === 'undefined') {
                context.report(resource, getMessage('shouldHaveProperty', context.language, propertyName));
            }
        };

        const checkIfPropertyValueIsNotEmpty = (resource: string, content: string | undefined, propertyName: string, getLocation: IJSONLocationFunction) => {
            if (typeof content === 'string' && (content.trim() === '')) {
                const message = getMessage('shouldHaveNonEmptyProperty', context.language, propertyName);
                const location = getLocation(propertyName, { at: 'value' });

                context.report(resource, message, { location });
            }
        };

        const checkIfPropertyValueIsUnderLimit = (resource: string, content: string | undefined, propertyName: string, shortNameLengthLimit: number, getLocation: IJSONLocationFunction) => {
            if (content && (ucs2.decode(content).length > shortNameLengthLimit)) {
                const message = getMessage('shouldHavePropertyShort', context.language, [propertyName, shortNameLengthLimit.toString()]);
                const location = getLocation(propertyName, { at: 'value' });

                context.report(resource, message, { location });

                return false;
            }

            return true;
        };

        const validate = ({ getLocation, parsedContent: manifest, resource }: ManifestParsed) => {
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

            checkIfPropertyExists(resource, name, 'name');
            checkIfPropertyValueIsNotEmpty(resource, name, 'name', getLocation);
            checkIfPropertyValueIsUnderLimit(resource, name, 'name', nameLengthLimit, getLocation);

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

            checkIfPropertyExists(resource, shortName, 'short_name');
            checkIfPropertyValueIsNotEmpty(resource, shortName, 'short_name', getLocation);
            checkIfPropertyValueIsUnderLimit(resource, shortName, 'short_name', shortNameLengthLimit, getLocation);
        };

        context.on('parse::end::manifest', validate);
    }
}
