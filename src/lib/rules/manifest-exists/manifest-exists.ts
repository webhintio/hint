/**
 * @fileoverview Check if a web app manifest is specified in the page
 * and the manifest file actually exists.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import { Rule, RuleBuilder, ElementFoundEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = require('debug')('sonar:rules:manifest-exists');

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: RuleBuilder = {
    create(context: RuleContext): Rule {

        let manifestIsSpecified = false;

        const manifestWasSpecified = () => {

            // If no manifest file was specified when the
            // parsing of the page ended, emit an error.

            if (!manifestIsSpecified) {
                context.report(null, null, 'Web app manifest file not specified');
            }
        };

        const manifestExists = async (data: ElementFoundEvent) => {
            const { element, resource } = data;

            if (element.getAttribute('rel') === 'manifest') {

                // If we encounter more the one <link rel="manifest"...>.
                if (manifestIsSpecified) {
                    context.report(resource, element, 'Web app manifest file already specified');

                    return;
                }

                manifestIsSpecified = true;

                // Determin if a web app manifest file is specified
                // and it actually exists.
                //
                // https://w3c.github.io/manifest/#obtaining

                const manifestHref = element.getAttribute('href');
                let manifestURL = '';

                // If the `href` doesn't exist or it's an empty string.
                if (!manifestHref) {
                    context.report(resource, element, `Web app manifest file is specified with invalid 'href'`);

                    return;
                }

                // If the `href` exists and is not an empty string
                // try to figure out the full URL of the manifest.

                if (url.parse(manifestHref).protocol) {
                    manifestURL = manifestHref;
                } else {
                    manifestURL = url.resolve(resource, manifestHref);
                }

                // Try to see if the manifest file actually exists
                // and is accesible.

                // TODO:
                try {
                    await context.pageRequest(manifestURL);
                } catch (e) {
                    debug('Failed to fetch the web app manifest file');
                    context.report(resource, element, `Web app manifest file cannot be fetched`);
                }

            }
        };

        return {
            'element::link': manifestExists,
            'traverse::end': manifestWasSpecified
        };
    },
    meta: {
        docs: {
            category: 'PWA',
            description: 'Provide a web app manifest file',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

module.exports = rule;
