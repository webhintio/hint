/**
 * @fileoverview Check if error pages have the size under a certain
 * threshold.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as url from 'url';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IFetchEnd, INetworkData, IResponse, ITraverseEnd, IRule, IRuleBuilder } from 'sonarwhal/dist/src/lib/types';
import { isDataURI } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        // This rule mainly applies to Internet Explorer 5-11.

        if (!['ie 5', 'ie 6', 'ie 7', 'ie 8', 'ie 9', 'ie 10', 'ie 11'].some((e) => {
            return context.targetedBrowsers.includes(e);
        })) {
            debug(`Rule does not apply for targeted browsers`);

            return {};
        }

        const foundErrorPages = {};

        /*
         * Default thresholds:
         * https://blogs.msdn.microsoft.com/ieinternals/2010/08/18/friendly-http-error-pages/
         */

        const statusCodesWith256Threshold: Array<number> = [403, 405, 410];
        const statusCodesWith512Threshold: Array<number> = [400, 404, 406, 408, 409, 500, 501, 505];

        const checkForErrorPages = (fetchEnd: IFetchEnd) => {
            const { resource, response }: { resource: string, response: IResponse } = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const statusCode: number = response.statusCode;
            const size: number = (response.body.rawContent || []).length;

            /*
             * This rule doesn't care about individual responses, only
             * if, in general, for a certain error response the size
             * of the response was over a specific threshold, therefore,
             * there is no need to report every error response.
             */

            if (((size < 512) && statusCodesWith512Threshold.includes(statusCode)) ||
                ((size < 256) && statusCodesWith256Threshold.includes(statusCode))) {
                foundErrorPages[statusCode] = {
                    size,
                    url: response.url
                };
            }
        };

        const tryToGenerateErrorPage = async (targetURL: string) => {
            const baseURL: string = url.format(Object.assign(url.parse(targetURL), {
                fragment: false,
                search: false
            }));

            /*
             * The following will make a request to:
             *
             *    <site>/.well-known/<random-number>
             *
             * Why `.well-known/`? Because it's a standard location
             * (https://tools.ietf.org/html/rfc5785), where
             * theoretically, only certain things should exists
             * (https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml),
             * so the request should have a higher chance of generating
             * an error response (most likely a 404) then making
             * a request to something such as:
             *
             *    <site>/<random-number>
             *
             * which might actually be mapped to something.
             */

            try {
                const networkData: INetworkData = await context.fetchContent(url.resolve(baseURL, `.well-known/${Math.random()}`));

                checkForErrorPages({
                    element: null,
                    request: networkData.request,
                    resource: targetURL,
                    response: networkData.response
                });
            } catch (e) {
                // This will most likely fail because target is a local file.
                debug(`Custom request to generate error response failed for: ${targetURL}`);
            }

        };

        const validate = async (event: ITraverseEnd) => {

            /*
             * If no error responses were found, and more specifically,
             * if no 404 error response was found, try to generate one.
             *
             * (404 because the following function will most likely
             *  generate a 404 error response, other responses cannot
             *  be generated... so easily).
             */

            const { resource: href }: { resource: string } = event;

            if (Object.keys(foundErrorPages).length === 0 || !foundErrorPages[404]) {
                await tryToGenerateErrorPage(href);
            }

            for (const key of Object.keys(foundErrorPages)) {
                const threshold = statusCodesWith512Threshold.includes(Number.parseInt(key)) ? 512 : 256;

                await context.report(href, null, `Response with status code ${key} had less than ${threshold} bytes`);
            }
        };

        return {
            'fetch::end': checkForErrorPages,
            'manifestfetch::end': checkForErrorPages,
            'targetfetch::end': checkForErrorPages,
            'traverse::end': validate
        };
    },
    meta: {
        docs: {
            category: Category.interoperability,
            description: 'Disallow small error pages'
        },
        recommended: true,
        schema: [],
        worksWithLocalFiles: false
    }
};

module.exports = rule;
