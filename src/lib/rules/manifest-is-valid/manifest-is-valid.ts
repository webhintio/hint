/**
 * @fileoverview Check if the content of the web app manifest file is valid.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as d from 'debug';
const debug = d('sonar:rules:manifest-is-valid');

import * as url from 'url';

import { Rule, RuleBuilder, ElementFoundEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: RuleBuilder = {
    create(context: RuleContext): Rule {

        const manifestIsValid = async (data: ElementFoundEvent) => {
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
            category: 'PWA',
            description: 'Check if the content of the web app manifest is valid',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

export default rule;
