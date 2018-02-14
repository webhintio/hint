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
import { IAsyncHTMLElement, IElementFound, IFetchEnd, IManifestFetchError, ITraverseEnd, IRule, IRuleBuilder } from 'sonarwhal/dist/src/lib/types';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let manifestIsSpecified = false;

        const manifestMissing = async (event: ITraverseEnd) => {
            if (!manifestIsSpecified) {
                await context.report(event.resource, null, 'Manifest not specified');
            }
        };

        const manifestExists = async (data: IElementFound) => {
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

        const manifestEnd = async (event: IFetchEnd) => {
            // TODO: check why CDP sends sometimes status 301
            if (event.response.statusCode >= 400) {
                await context.report(event.resource, null, `Manifest file could not be fetched (status code: ${event.response.statusCode})`);
            }
        };

        const manifestError = async (event: IManifestFetchError) => {
            debug('Failed to fetch the web app manifest file');
            await context.report(event.resource, null, `Manifest file request failed`);

            return;
        };

        return {
            'element::link': manifestExists,
            'fetch::end::manifest': manifestEnd,
            'fetch::error::manifest': manifestError,
            'traverse::end': manifestMissing
        };
    },
    meta: {
        docs: {
            category: Category.pwa,
            description: 'Require a web app manifest'
        },
        schema: [],
        scope: RuleScope.any
    }
};

export default rule;
