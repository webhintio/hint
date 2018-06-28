/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, FetchEnd, Response, IRule, RuleMetadata } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import { RuleContext } from 'hint/dist/src/lib/rule-context';
import { RuleScope } from 'hint/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class XContentTypeOptionsRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.security,
            description: `Require 'X-Content-Type-Options' header`
        },
        id: 'x-content-type-options',
        schema: [],
        scope: RuleScope.site
    }

    public constructor(context: RuleContext) {

        const validate = async (fetchEnd: FetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: Response } = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            let headerIsRequired = false;

            const headerValue: string = normalizeString(response.headers && response.headers['x-content-type-options']);
            const nodeName = element && normalizeString(element.nodeName);

            /*
             * See:
             *
             *  * https://github.com/whatwg/fetch/issues/395
             *  * https://fetch.spec.whatwg.org/#x-content-type-options-header
             */

            if (nodeName === 'script' ||
                (nodeName === 'link' && normalizeString(element.getAttribute('rel')) === 'stylesheet')) {
                headerIsRequired = true;
            }

            if (headerIsRequired) {
                if (headerValue === null) {
                    await context.report(resource, element, `'x-content-type-options' header is not specified`);

                    return;
                }

                if (headerValue !== 'nosniff') {
                    await context.report(resource, element, `'x-content-type-options' header value (${headerValue}) is invalid`);

                    return;
                }

                return;
            }

            if (headerValue) {
                await context.report(resource, element, `'x-content-type-options' header is not needed`);
            }
        };

        context.on('fetch::end::*', validate);
    }
}
