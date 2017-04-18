/**
 * @fileoverview Check if error pages have the size under a certain
 * threshold.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import { debug as d } from '../../utils/debug';
import { IFetchEndEvent, ITraverseEndEvent, IRule, IRuleBuilder } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        // Default thresholds:
        // https://blogs.msdn.microsoft.com/ieinternals/2010/08/18/friendly-http-error-pages/

        const statusCodesWith256Threshold = [403, 405, 410];
        const statusCodesWith512Threshold = [400, 404, 406, 408, 409, 500, 501, 505];

        const foundErrorPages = {};

        const checkForErrorPages = (fetchEnd: IFetchEndEvent) => {
            const { resource, response } = fetchEnd;
            const statusCode = response.statusCode;
            // Ignore requests to local files.

            if (!statusCode) {
                debug(`Ignore request to local file: ${resource}`);

                return;
            }

            // This is only accurate if the encoding used by the
            // collectors was also `utf8`.
            //
            // See: https://github.com/MicrosoftEdge/Sonar/issues/89

            // TODO: replace the following with:
            // const size = response.body.rawContent.length;
            const size = Buffer.byteLength(<string>response.body.content, 'utf8');

            // This rule doesn't care about individual responses, only
            // if, in general, for a certain error response the size
            // of the response was over a specific threshold, therefore,
            // there is no need to report every error response.

            if (((size < 512) && statusCodesWith512Threshold.includes(statusCode)) ||
                ((size < 256) && statusCodesWith256Threshold.includes(statusCode))) {
                foundErrorPages[statusCode] = {
                    size,
                    url: response.url
                };
            }
        };

        const tryToGenerateErrorPage = async (targetURL: string) => {
            const baseURL = url.format(Object.assign(url.parse(targetURL), {
                fragment: false,
                search: false
            }));

            // The following will make a request to:
            //
            //    <site>/.well-known/<random-number>
            //
            // Why `.well-known/`? Because it's a standard location
            // (https://tools.ietf.org/html/rfc5785), where
            // theoretically, only certain things should exists
            // (https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml),
            // so the request should have a higher chance of generating
            // an error response (most likely a 404) then making
            // a request to something such as:
            //
            //    <site>/<random-number>
            //
            // which might actually be mapped to something.

            try {
                const networkData = await context.fetchContent(url.resolve(baseURL, `.well-known/${Math.random()}`));

                checkForErrorPages({
                    element: null,
                    request: networkData.request,
                    resource: targetURL,
                    response: networkData.response
                });
            } catch (e) {
                // This will most likely fail because target is a local file.
                debug(`Custom request to generate 404 response failed for: ${targetURL}`);
            }

        };

        const validate = async (event: ITraverseEndEvent) => {

            // If no error responses were found, and more specifically,
            // if no 404 error response was found, try to generate one.
            //
            // (404 because the following function will most likely
            //  generate a 404 error response, other responses cannot
            //  be generated... so easily).

            const { resource: href } = event;

            if (Object.keys(foundErrorPages).length === 0 || !foundErrorPages[404]) {
                await tryToGenerateErrorPage(href);
            }

            for (const key of Object.keys(foundErrorPages)) {
                const threshold = statusCodesWith512Threshold.includes(Number.parseInt(key)) ? 512 : 256;

                context.report(href, null, `Response with statusCode ${key} had less than ${threshold} bytes`);
            }
        };

        return {
            'fetch::end': checkForErrorPages,
            'targetfetch::end': checkForErrorPages,
            'traverse::end': validate
        };
    },
    meta: {
        docs: {
            category: 'interoperability',
            description: 'Disallow small error pages',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

module.exports = rule;
