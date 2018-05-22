/**
 * @fileoverview `no-p3p` disallows the use of `P3P`
 */

import { URL } from 'url';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IAsyncHTMLElement, ElementFound, FetchEnd, Response, IRule, RuleMetadata, ScanStart } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { getIncludedHeaders } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoP3pRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.development,
            description: `Don't use P3P related headers or meta tags`
        },
        id: 'no-p3p',
        schema: [],
        scope: RuleScope.site
    }

    public constructor(context: RuleContext) {

        const errorMessage = 'P3P is deprecated and should not be used';

        /**
         * Verifies the server doesn't respond with any content to the well-known location
         * (/w3c/p3p.xml) defined in the spec https://www.w3.org/TR/P3P11/#Well_Known_Location
         */
        const validateWellKnown = async (scanStart: ScanStart) => {
            const { resource } = scanStart;
            const wellKnown = new URL('/w3c/p3p.xml', resource);
            const result = await context.fetchContent(wellKnown);

            if (result.response.statusCode === 200) {
                await context.report(wellKnown.toString(), null, errorMessage);
            }
        };

        /**
         * Verifies none of the responses have the `p3p` header
         * https://www.w3.org/TR/P3P11/#syntax_ext
         */
        const validateHeaders = async (fetchEnd: FetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: Response } = fetchEnd;
            const headers: Array<string> = getIncludedHeaders(response.headers, ['p3p']);
            const numberOfHeaders: number = headers.length;

            if (numberOfHeaders > 0) {
                await context.report(resource, element, errorMessage);
            }
        };

        /**
         * Checks there isn't any `<link rel="P3Pv1">` in the document
         * https://www.w3.org/TR/P3P11/#syntax_link
         */
        const validateHtml = async (data: ElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            const rel: string = element.getAttribute('rel');

            if (rel && normalizeString(rel) === 'p3pv1') {
                await context.report(resource, element, errorMessage);
            }
        };

        context.on('scan::start', validateWellKnown);
        context.on('fetch::end::*', validateHeaders);
        context.on('element::link', validateHtml);
    }
}
