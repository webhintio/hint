/**
 * @fileoverview Check if `.webmanifest` is used as the file extension
 * for the web app manifest file.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';

import { Rule, RuleBuilder, ElementFoundEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = require('debug')('sonar:rules:manifest-file-extension');

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: RuleBuilder = {
    create(context: RuleContext): Rule {

        const standardManifestFileExtension = '.webmanifest';

        const validate = (data: ElementFoundEvent) => {
            const { element, resource } = data;

            if (element.getAttribute('rel') === 'manifest') {
                const href = element.getAttribute('href');
                const fileExtension = path.extname(href);

                if (fileExtension !== standardManifestFileExtension) {
                    debug('Web app manifest file with invalid extension found');

                    const location = context.findProblemLocation(element, fileExtension);

                    context.report(resource, element, `The file extension for the web app manifest file ('${href}') should be '${standardManifestFileExtension}' not '${fileExtension}'`, location);
                }
            }
        };

        return { 'element::link': validate };
    },
    meta: {
        docs: {
            category: 'PWA',
            description: 'Use `.webmanifest` as the file extension for the web app manifest file',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

module.exports = rule;
