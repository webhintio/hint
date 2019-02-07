/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { FetchEnd, IHint } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class XContentTypeOptionsHint implements IHint {

    public static readonly meta = meta;
    public constructor(context: HintContext) {
        const validate = async ({ element, resource, response }: FetchEnd) => {
            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headerValue: string | null = normalizeString(response.headers && response.headers['x-content-type-options']);

            if (headerValue === null) {
                await context.report(resource, `Response should include 'x-content-type-options' header.`, { element });

                return;
            }

            if (headerValue !== 'nosniff') {
                await context.report(resource, `'x-content-type-options' header value should be 'nosniff', not '${headerValue}'.`, { element });

                return;
            }

            return;
        };

        context.on('fetch::end::*', validate);
    }
}
