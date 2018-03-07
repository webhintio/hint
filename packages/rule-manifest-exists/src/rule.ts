/**
 * @fileoverview Check if a single web app manifest file is specified,
 * and if that specified file is accessible.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, ElementFound, FetchEnd, ManifestFetchError, TraverseEnd, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestExistsRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.pwa,
            description: 'Require a web app manifest'
        },
        id: 'manifest-exists',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        let manifestIsSpecified = false;

        const manifestMissing = async (event: TraverseEnd) => {
            if (!manifestIsSpecified) {
                await context.report(event.resource, null, 'Manifest not specified');
            }
        };

        const manifestExists = async (data: ElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (normalizeString(element.getAttribute('rel')) !== 'manifest') {

                return;
            }

            /*
             * Check if we encounter more than one
             * <link rel="manifest"...> declaration.
             */

            if (manifestIsSpecified) {
                await context.report(resource, element, 'Manifest already specified');

                return;
            }

            manifestIsSpecified = true;

            if (!element.getAttribute('href')) {
                /*
                 * `connector`s will ignore invalid `href` and will
                 * not even initiate the request so we have to check
                 * for those.
                 *
                 * TODO: find the relative location in the element
                 */
                await context.report(data.resource, data.element, `Manifest specified with invalid 'href'`);
            }
        };

        const manifestEnd = async (event: FetchEnd) => {
            // TODO: check why CDP sends sometimes status 301
            if (event.response.statusCode >= 400) {
                await context.report(event.resource, null, `Manifest file could not be fetched (status code: ${event.response.statusCode})`);
            }
        };

        const manifestError = async (event: ManifestFetchError) => {
            debug('Failed to fetch the web app manifest file');
            await context.report(event.resource, null, `Manifest file request failed`);

            return;
        };

        context.on('element::link', manifestExists);
        context.on('fetch::end::manifest', manifestEnd);
        context.on('fetch::error::manifest', manifestError);
        context.on('traverse::end', manifestMissing);
    }
}
