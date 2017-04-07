/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import { IElementFoundEvent, IRule, IRuleBuilder } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars
import { ruleDebug } from '../../util/rule-helpers';

const debug = ruleDebug(__dirname);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const manifestIsValid = async (data: IElementFoundEvent) => {
            const { element, resource } = data;

            if (element.getAttribute('rel') === 'manifest') {

                const manifestHref = element.getAttribute('href');

                if (!manifestHref) {
                    debug(`Web app manifest specified with invalid 'href'`);

                    return;
                }

                let manifestURL = '';

                // Try to figure out the URL of the web app manifest file.

                if (url.parse(manifestHref).protocol) {
                    manifestURL = manifestHref;
                } else {
                    manifestURL = url.resolve(resource, manifestHref);
                }

                // Try to get the content of the web app manifest file.

                try {
                    const { response: { body, statusCode } } = await context.fetchContent(manifestURL);

                    if (statusCode && statusCode !== 200) {
                        debug(`Web app manifest file could not be fetched (status code: ${statusCode})`);

                        return;
                    }

                    // Validate the content of the web app manifest file.

                    try {
                        JSON.parse(body);
                        // TODO: Add more complex web app manifest file validation.
                    } catch (e) {
                        debug('Failed to parse the web app manifest file');
                        context.report(resource, element, `Web app manifest file doesn't contain valid JSON`);
                    }

                } catch (e) {
                    debug('Failed to fetch the web app manifest file');
                }

            }
        };

        return { 'element::link': manifestIsValid };
    },
    meta: {
        docs: {
            category: 'pwa',
            description: 'Check if the content of the web app manifest is valid',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

export default rule;
