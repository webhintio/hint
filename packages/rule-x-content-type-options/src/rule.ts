/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IFetchEnd, IResponse, IRule, IRuleBuilder } from 'sonarwhal/dist/src/lib/types';
import { isDataURI, normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { Scope } from 'sonarwhal/dist/src/lib/enums/scope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: IResponse } = fetchEnd;

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

        return {
            'fetch::end': validate,
            'manifestfetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: Category.security,
            description: `Require 'X-Content-Type-Options' header`
        },
        schema: [],
        scope: Scope.site
    }
};

module.exports = rule;
