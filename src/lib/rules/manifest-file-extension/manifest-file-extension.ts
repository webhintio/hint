/**
 * @fileoverview Check if `.webmanifest` is used as the file extension
 * for the web app manifest file.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';

import { debug as d } from '../../utils/debug';
import { IAsyncHTMLElement, IElementFound, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { normalizeString } from '../../utils/misc';
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const standardManifestFileExtension: string = '.webmanifest';

        const validate = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (normalizeString(element.getAttribute('rel')) === 'manifest') {
                const href: string = normalizeString(element.getAttribute('href'));
                const fileExtension: string = path.extname(href);

                if (fileExtension !== standardManifestFileExtension) {
                    debug('Web app manifest file with invalid extension found');

                    await context.report(resource, element, `The file extension should be '${standardManifestFileExtension}' (not '${fileExtension}')`, fileExtension);
                }
            }
        };

        return { 'element::link': validate };
    },
    meta: {
        docs: {
            category: 'pwa',
            description: 'Require `.webmanifest` as the file extension for the web app manifest file'
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
