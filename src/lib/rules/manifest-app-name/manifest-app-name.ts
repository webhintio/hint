/**
 * @fileoverview Check if the web app manifest file includes the `name`
 * and `short_name` member with appropriate values.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { ucs2 } = require('punycode');

import { debug as d } from '../../utils/debug';
import { IManifestFetchEnd, IResponse, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const checkIfDefined = async (resource: string, content: string, memberName: string) => {
            if (typeof content === 'undefined') {
                await context.report(resource, null, `Manifest should contain the '${memberName}' member`);
            }
        };

        const checkIfNonEmpty = async (resource: string, content: string, memberName: string) => {
            if (content && (content.trim() === '')) {
                await context.report(resource, null, `Manifest should contain non-empty '${memberName}' member`);
            }
        };

        const checkIfUnderLimit = async (resource: string, content: string, memberName: string, shortNameLengthLimit: number) => {
            if (content && (ucs2.decode(content).length > shortNameLengthLimit)) {
                await context.report(resource, null, `Manifest should have '${memberName}' member under ${shortNameLengthLimit} characters`);

                return false;
            }

            return true;
        };

        const validate = async (data: IManifestFetchEnd) => {
            const { resource, response: { body: { content }, statusCode } }: { resource: string, response: IResponse } = data;

            if (statusCode !== 200) {
                debug('Request for manifest file has HTTP status code different than 200');

                return;
            }

            let jsonContent;

            try {
                jsonContent = JSON.parse(content);
            } catch (e) {
                debug('Manifest file does not contain valid JSON');

                return;
            }

            const name = jsonContent.name;

            // The 30 character limit is used in order to be consistent
            // with the native OSes/app stores limits/recommendations.
            //
            // https://developer.apple.com/app-store/product-page/
            // https://support.google.com/googleplay/android-developer/answer/113469#store_listing

            const nameLengthLimit = 30;

            // The 12 character limit is used to ensure that for most
            // cases the value won't be truncated. However depending
            // on other things such as:
            //
            //  * what font the user is using
            //  * what characters the web site/app name includes
            //    (e.g. `i` occupies less space then `W`)
            //
            //  the text may still be truncated even if it's under
            //  12 characters.
            //
            //  https://github.com/sonarwhal/sonar/issues/136
            //
            //  Note: This is also consistent with what the Chrome team
            //  used to, and still recommends.
            //
            //  https://developer.chrome.com/apps/manifest/name#short_name

            const shortNameLengthLimit = 12;

            await checkIfDefined(resource, name, 'name');
            await checkIfNonEmpty(resource, name, 'name');
            await checkIfUnderLimit(resource, name, 'name', nameLengthLimit);

            const shortName = jsonContent.short_name;
            const shortNameIsRequired = name && (name.trim() !== '') && (ucs2.decode(name).length > shortNameLengthLimit);

            // Validate 'short_name' if:
            //
            //  * it's specified
            //  * if `name` is over the `short_name` length limit

            if (!shortName && !shortNameIsRequired) {
                return;
            }

            await checkIfDefined(resource, shortName, 'short_name');
            await checkIfNonEmpty(resource, shortName, 'short_name');
            await checkIfUnderLimit(resource, shortName, 'short_name', shortNameLengthLimit);
        };

        return { 'manifestfetch::end': validate };
    },

    meta: {
        docs: {
            category: 'pwa',
            description: 'Require web site/app name to be specified'
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
