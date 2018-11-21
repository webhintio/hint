/**
 * @fileoverview `no-p3p` disallows the use of `P3P`
 */

import { URL } from 'url';

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ElementFound, FetchEnd, IHint, ScanStart } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { getIncludedHeaders } from 'hint/dist/src/lib/utils/hint-helpers';

import meta from './meta';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoP3pHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const errorMessage = 'P3P should not be used as it is deprecated.';
        /**
         * Verifies the server doesn't respond with any content to the well-known location
         * (/w3c/p3p.xml) defined in the spec https://www.w3.org/TR/P3P11/#Well_Known_Location
         */
        const validateWellKnown = async (scanStart: ScanStart) => {
            try {
                const { resource } = scanStart;
                const wellKnown = new URL('/w3c/p3p.xml', resource);
                const result = await context.fetchContent(wellKnown);

                if (result.response.statusCode === 200) {
                    await context.report(wellKnown.toString(), errorMessage);
                }
            } catch (e) {
                /*
                 * There's a problem accessing the URL. E.g.: "SSL Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE"
                 * The error is outside the scope of the hint so we ignore it
                 */
                debug(e);
            }
        };

        /**
         * Verifies none of the responses have the `p3p` header
         * https://www.w3.org/TR/P3P11/#syntax_ext
         */
        const validateHeaders = async ({ element, resource, response }: FetchEnd) => {
            const headers: string[] = getIncludedHeaders(response.headers, ['p3p']);
            const numberOfHeaders: number = headers.length;

            if (numberOfHeaders > 0) {
                await context.report(resource, errorMessage, { element });
            }
        };

        /**
         * Checks there isn't any `<link rel="P3Pv1">` in the document
         * https://www.w3.org/TR/P3P11/#syntax_link
         */
        const validateHtml = async ({ element, resource }: ElementFound) => {
            const rel: string | null = element.getAttribute('rel');

            if (rel && normalizeString(rel) === 'p3pv1') {
                await context.report(resource, errorMessage, { element });
            }
        };

        context.on('scan::start', validateWellKnown);
        context.on('fetch::end::*', validateHeaders);
        context.on('element::link', validateHtml);
    }
}
