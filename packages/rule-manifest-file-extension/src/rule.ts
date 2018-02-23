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
import { IAsyncHTMLElement, IElementFound, IRule } from 'sonarwhal/dist/src/lib/types';
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
    private _id: string;

    public get id() {
        return this._id;
    }

    public static readonly meta = {
        docs: {
            category: Category.pwa,
            description: 'Require `.webmanifest` as the file extension for the web app manifest file'
        },
        schema: [],
        scope: RuleScope.any
    }

    public constructor(id: string, context: RuleContext) {

        this._id = id;

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

        context.on(this.id, 'element::link', validate);
    }
}
