/**
 * @fileoverview Check if `.webmanifest` is used as the file extension
 * for the web app manifest file.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IElementFound, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { getFileExtension, normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestFileExtensionRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require `.webmanifest` as the file extension for the web app manifest file'
        },
        id: 'manifest-file-extension',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        const standardManifestFileExtension: string = 'webmanifest';

        const validate = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (normalizeString(element.getAttribute('rel')) === 'manifest') {
                const href: string = normalizeString(element.getAttribute('href'));
                const fileExtension: string = getFileExtension(href);

                if (fileExtension !== standardManifestFileExtension) {
                    debug('Manifest file with invalid extension found');

                    await context.report(resource, element, `The file extension should be '${standardManifestFileExtension}'${fileExtension ? ` (not '${fileExtension}')` : ''}`, fileExtension);
                }
            }
        };

        context.on('element::link', validate);
    }
}
