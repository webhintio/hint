/**
 * @fileoverview Check if responses served over HTTPS also have the Strict-Transport-Security header with a proper value max-age value.
 */
import * as url from 'url';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IResponse, IFetchEnd, IRule, INetworkData, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class StrictTransportSecurityRule implements IRule {
    private _id: string;

    public get id() {
        return this._id;
    }

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.security,
            description: `Require 'Strict-Transport-Security' header`
        },
        schema: [{
            properties: {
                checkPreload: { type: 'boolean' },
                minMaxAgeValue: { type: 'number' }
            }
        }],
        scope: RuleScope.site
    }

    public constructor(id: string, context: RuleContext) {

        this._id = id;

        /** The minimum period (in seconds) allowed for `max-age`. */
        let minMaxAgeValue: number;
        /** Whether or not check the preload attribute */
        let checkPreload: boolean;
        /** Endpoint to verify that the domain name has already been included in the `preload list` */
        const statusApiEndPoint = `https://hstspreload.org/api/v2/status?domain=`;
        /** Endpoint to verify that the domain name is qualified to be preloaded */
        const preloadableApiEndPoint = `https://hstspreload.org/api/v2/preloadable?domain=`;

        /*
         * HACK: Need to do a require here in order to be capable of mocking
         * when testing the rule and `import` doesn't work here.
         */
        const { isHTTPS, normalizeString, requestJSONAsync } = require('sonarwhal/dist/src/lib/utils/misc');

        const loadRuleConfigs = () => {
            minMaxAgeValue = (context.ruleOptions && context.ruleOptions.minMaxAgeValue) || 10886400; // 18 weeks
            checkPreload = (context.ruleOptions && context.ruleOptions.checkPreload);
        };

        /*
         * STS header Syntax:
         * Strict-Transport-Security: max-age=<expire-time>
         * Strict-Transport-Security: max-age=<expire-time>; includeSubDomains
         * Strict-Transport-Security: max-age=<expire-time>; preload
         * This function accomplishes the following:
         * "max-age=31536000; includesubdomains; preload" => {"max-age":31536000,"includesubdomains":true,"preload":true}
         */
        const parse = (headerValue: string) => {
            const parsedHeader = {};
            const directives = headerValue.toLowerCase().split(';');
            const nameValuePairRegex = /^ *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[~0-9])*"|[!#$%&'*+.^_`|~0-9]+) *$/;
            /*
             * Regex for name-value pairs. E.g.: max-age=31536000
             * Modified usage of https://github.com/jshttp/content-type/blob/64bde0d996ccb4334341662c0c7d25f7b370c4d9/index.js#L23
             */
            const tokenRegex = /^ *[!#$%&'*+.^_`|~0-9A-Za-z-]+$/; // Regex for single tokens. E.g.:  includesubdomains

            directives.forEach((directive) => {
                const match = tokenRegex.exec(directive) || nameValuePairRegex.exec(directive);

                if (!match) {
                    throw new Error(`'strict-transport-security' header has the wrong format: ${directive}`);
                }

                const [matchString, key, value] = match;
                const name = key || matchString.trim();

                if (parsedHeader[name]) {
                    throw new Error(`'strict-transport-security' header contains more than one '${name}'`);
                }

                parsedHeader[name] = value || true;
            });

            return parsedHeader;
        };

        const isUnderAgeLimit = (maxAge: string, limit: number): boolean => {
            return maxAge && parseInt(maxAge) < limit;
        };

        const isPreloaded = (hostname: string): Promise<{ [key: string]: any }> => {
            debug(`Waiting to get preload status for ${hostname}`);

            return requestJSONAsync(`${statusApiEndPoint}${hostname}`);
        };

        const issuesToPreload = (hostname: string): Promise<{ [key: string]: any }> => {
            debug(`Waiting to get preload eligibility for ${hostname}`);

            return requestJSONAsync(`${preloadableApiEndPoint}${hostname}`);
        };

        const verifyPreload = async (resource): Promise<{ [key: string]: any }> => {
            const originalDomain = url.parse(resource).hostname;
            const mainDomain = originalDomain.replace(/^www./, '');
            // Some hostnames in the list include `www.`, e.g., `www.gov.uk`.
            let status: string;
            let issues: { [key: string]: any } = {};

            try {
                ({ status } = await isPreloaded(mainDomain) || await isPreloaded(originalDomain));
            } catch (err) {
                const message = `Error with getting preload status for ${resource}.`;

                debug(message, err);
                await context.report(resource, null, message);

                return issues;
            }

            debug(`Received preload status for ${resource}.`);

            if (!status) {
                const message = `Error with getting preload status for ${resource}. There might be something wrong with the verification endpoint.`;

                debug(message);
                await context.report(resource, null, message);

                return issues;
            }

            if (status !== 'preloaded') {
                try {
                    issues = await issuesToPreload(mainDomain);
                } catch (err) {
                    const message = `Error with getting preload eligibility for ${resource}.`;

                    debug(message, err);
                    await context.report(resource, null, message);
                }

                debug(`Received preload eligibility for ${resource}.`);
            }

            return issues;
        };

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: IResponse } = fetchEnd;

            const headerValue: string = normalizeString(response.headers && response.headers['strict-transport-security']);
            let parsedHeader;

            if (!isHTTPS(resource) && headerValue) {
                await context.report(resource, element, `'strict-transport-security' header should't be specified in pages served over HTTP.`);

                return;
            }

            if (!isHTTPS(resource) && !headerValue) {
                const httpsResource = url.format(Object.assign(url.parse(resource), { protocol: `https` }));

                try {
                    const networkData: INetworkData = await context.fetchContent(httpsResource);

                    if (!networkData || !networkData.response) {
                        return;
                    }

                    if (networkData.response.statusCode === 200) {
                        validate({
                            element: null,
                            request: networkData.request,
                            resource: httpsResource,
                            response: networkData.response
                        });
                    }
                } catch (err) {
                    // HTTPS site can't be fetched, do nothing.
                    debug(`${resource} doesn't support HTTPS`);
                }

                return;
            }

            // Check if the header `Strict-Transport-Security` is sent for resources served over HTTPS.
            if (!headerValue) {
                await context.report(resource, element, `'strict-transport-security' header was not specified`);

                return;
            }
            // Parse header and report repetitive attributes
            try {
                parsedHeader = parse(headerValue);
            } catch (err) {
                await context.report(resource, element, err.message);

                return;
            }

            // Verify preload attribute
            if (checkPreload && parsedHeader.preload) {
                const { errors } = await verifyPreload(resource);

                if (errors) {
                    errors.forEach((error) => {
                        context.report(resource, element, error.message);
                    });

                    return;
                }
            }

            const maxAge = parsedHeader['max-age'];

            // Check if header `Strict-Transport-Security` contains `max-age` directive.
            if (!maxAge) {
                await context.report(resource, element, `'strict-transport-security' header requires 'max-age' directive`);

                return;
            }

            // Check if the `max-age` value is smaller than the minimum of max-age defined
            if (isUnderAgeLimit(maxAge, minMaxAgeValue)) {
                await context.report(resource, element, `'strict-transport-security' header 'max-age' value should be more than ${minMaxAgeValue}`);

                return;
            }
        };

        loadRuleConfigs();

        context.on(this.id, 'fetch::end::*', validate);
    }
}
