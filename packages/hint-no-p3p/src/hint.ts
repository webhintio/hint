/**
 * @fileoverview `no-p3p` disallows the use of `P3P`
 */

import { URL } from 'url';

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IAsyncHTMLElement, ElementFound, FetchEnd, Response, IHint, HintMetadata, ScanStart } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { getIncludedHeaders } from 'hint/dist/src/lib/utils/hint-helpers';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoP3pHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Don't use P3P related headers or meta tags`
        },
        id: 'no-p3p',
        schema: [],
        scope: HintScope.site
    }

    public constructor(context: HintContext) {

        const errorMessage = 'P3P should not be used as it is deprecated.';
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
