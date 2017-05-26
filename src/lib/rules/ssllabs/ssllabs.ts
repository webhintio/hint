/**
 * @fileoverview Checks how secure the SSL configuration is for the given target
 * using SSL Labs online tool.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

// HACK: Needed here because with TS `eslint-disable-line` doesn't work fine.
/* eslint-disable no-useless-escape */

import * as pify from 'pify';

import { debug as d } from '../../utils/debug';
import { ITargetFetchEnd, IScanEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        /** The promise that represents the scan by SSL Labs. */
        let promise: Promise<any>;
        /** The minimum grade required to pass. */
        let minimumGrade = 'A-';
        /** The options to pass to the SSL Labs scanner. */
        let scanOptions = {
            all: 'done',
            fromCache: true,
            host: '',
            maxAge: 2
        };

        /** Enum with the different possible grades for an endpoint returned by SSL Labs scan.
         *
         * https://github.com/ssllabs/ssllabs-scan/blob/stable/ssllabs-api-docs.md#endpoint
        */
        enum Grades {
            'A+' = 1,
            A,
            'A-',
            B,
            C,
            D,
            E,
            F,
            M,
            T
        }

        const loadRuleConfig = () => {
            minimumGrade = (context.ruleOptions && context.ruleOptions.grade) || 'A-';
            const userSslOptions = (context.ruleOptions && context.ruleOptions.ssllabs) || {};

            scanOptions = Object.assign(scanOptions, userSslOptions);
        };

        const verifyEndpoint = (resource) => {
            return (endpoint) => {
                const { grade, serverName = resource, details } = endpoint;

                if (!grade && details.protocols.length === 0) {
                    const message = `${resource} doesn't support HTTPS.`;

                    debug(message);
                    context.report(resource, null, message);

                    return;
                }

                const calculatedGrade = Grades[grade];
                const calculatedMiniumGrade = Grades[minimumGrade];

                if (calculatedGrade > calculatedMiniumGrade) {
                    const message = `${serverName}'s grade ${grade} doesn't meet the minimum ${minimumGrade} required.`;

                    debug(message);
                    context.report(resource, null, message);
                } else {
                    debug(`Grade ${grade} for ${resource} is ok.`);
                }
            };
        };

        const start = (data: ITargetFetchEnd) => {
            const { resource } = data;

            if (!resource.startsWith('https://')) {
                const message = `${resource} doesn't support HTTPS.`;

                debug(message);
                context.report(resource, null, message);

                return;
            }

            /* HACK: Need to do a require here in order to be capable of mocking
                when testing the rule and `import` doesn't work here. */
            const ssl = require('node-ssllabs');
            const sslabs = pify(ssl);

            debug(`Starting SSL Labs scan for ${resource}`);
            scanOptions.host = resource;

            promise = sslabs.scan(scanOptions);
        };

        const end = async (data: IScanEndEvent): Promise<any> => {
            const { resource } = data;

            if (!promise) {
                return;
            }

            debug(`Waiting for SSL Labs results for ${resource}`);
            let host;

            try {
                host = await promise;
            } catch (e) {
                debug(`Error getting data for ${resource} %O`, e);
                await context.report(resource, null, `Couldn't get results from SSL Labs for ${resource}.`);

                return;
            }

            debug(`Received SSL Labs results for ${resource}`);

            if (!host.endpoints || host.endpoints.length === 0) {
                const msg = `Didn't get any result for ${resource}.
There might be something wrong with SSL Labs servers.`;

                debug(msg);
                await context.report(resource, null, msg);

                return;
            }

            host.endpoints.forEach(verifyEndpoint(resource));
        };

        loadRuleConfig();

        /* We are using `targetfetch::end` instead of `scan::start`
         * or `targetfetch::start` because the `ssllabs` API doesn't
         * follow the redirects, so we need to use the final url
         * (e.g.: https://developer.microsoft.com/en-us/microsoft-edge/
         * instead of http://edge.ms).
         */
        return {
            'scan::end': end,
            'targetfetch::end': start
        };
    },
    meta: {
        docs: {
            category: 'security',
            description: 'Strength of your SSL configuration'
        },
        fixable: 'none',
        recommended: true,
        schema: [{
            additionalProperties: false,
            properties: {
                grade: {
                    pattern: '^(A\+|A\-|[A-F]|T|M)$',
                    type: 'string'
                },
                ssllabs: {
                    additionalProperties: false,
                    properties: {
                        all: {
                            pattern: '^(on|done)$',
                            type: 'string'
                        },
                        fromCache: { type: 'boolean' },
                        ignoreMismatch: { type: 'boolean' },
                        maxAge: {
                            minimum: 0,
                            type: 'integer'
                        },
                        publish: { type: 'boolean' },
                        startNew: { type: 'boolean' }
                    },
                    type: 'object'
                }
            },
            type: 'object'
        }],
        worksWithLocalFiles: false
    }
};

export default rule;
