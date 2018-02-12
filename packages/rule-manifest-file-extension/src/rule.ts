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
import { IAsyncHTMLElement, IElementFound, IRule, IRuleBuilder } from 'sonarwhal/dist/src/lib/types';
import { getFileExtension, normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const standardManifestFileExtension: string = 'webmanifest';

        const validate = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (normalizeString(element.getAttribute('rel')) === 'manifest') {
                const href: string = normalizeString(element.getAttribute('href'));
                const fileExtension: string = getFileExtension(href);

                if (fileExtension !== standardManifestFileExtension) {
                    debug('Manifest file with invalid extension found');

                    await context.report(resource, element, `The file extension should be '${standardManifestFileExtension}'${fileExtension ? ` (not '${fileExtension}')`: ''}`, fileExtension);
                }
            }
        };

        return { 'element::link': validate };
    },
    meta: {
        docs: {
            category: Category.pwa,
            description: 'Require `.webmanifest` as the file extension for the web app manifest file'
        },
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;
