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
import { IAsyncHTMLElement, ElementFound, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import getFileExtension from 'sonarwhal/dist/src/lib/utils/fs/file-extension';
import normalizeString from 'sonarwhal/dist/src/lib/utils/misc/normalize-string';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

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

        const validate = async (data: ElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (normalizeString(element.getAttribute('rel')) === 'manifest') {
                const fileExtension: string = getFileExtension(normalizeString(element.getAttribute('href')));

                if (fileExtension !== standardManifestFileExtension) {
                    await context.report(resource, element, `The file extension should be '${standardManifestFileExtension}'${fileExtension ? ` (not '${fileExtension}')` : ''}`, fileExtension);
                }
            }
        };

        context.on('element::link', validate);
    }
}
