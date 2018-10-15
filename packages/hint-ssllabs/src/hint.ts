/**
 * @fileoverview Checks how secure the SSL configuration is for the given target
 * using SSL Labs online tool.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

// HACK: Needed here because with TS `eslint-disable-line` doesn't work fine.

import { promisify } from 'util';

import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { FetchEnd, ScanEnd, IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { Grades, SSLLabsEndpoint, SSLLabsEndpointDetail, SSLLabsOptions, SSLLabsResult } from './types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class SSLLabsHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.security,
            description: 'Strength of your SSL configuration'
        },
        id: 'ssllabs',
        schema: [{
            additionalProperties: false,
            properties: {
                grade: {
                    pattern: '^(A\\+|A\\-|[A-F]|T|M)$',
                    type: 'string'
                },
                ssllabs: {
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
        scope: HintScope.site
    }

    public constructor(context: HintContext) {

        /** The promise that represents the scan by SSL Labs. */
        let promise: Promise<SSLLabsResult>;
        /** The minimum grade required to pass. */
        let minimumGrade: keyof typeof Grades = 'A-';
        /** The options to pass to the SSL Labs scanner. */
        let scanOptions: SSLLabsOptions = {
            all: 'done',
            fromCache: true,
            host: '',
            maxAge: 2
        };
        /** Error processing the request if any. */
        let failed: boolean = false;

        const loadHintConfig = () => {
            minimumGrade = (context.hintOptions && context.hintOptions.grade) || 'A-';
            const userSslOptions = (context.hintOptions && context.hintOptions.ssllabs) || {};

            scanOptions = Object.assign(scanOptions, userSslOptions);
        };

        const verifyEndpoint = async (resource: string, endpoint: SSLLabsEndpoint) => {
            const { grade, serverName = resource, details }: { grade: keyof typeof Grades, serverName: string, details: SSLLabsEndpointDetail } = endpoint;

            if (!grade && details.protocols.length === 0) {
                const message = `'${resource}' does not support HTTPS.`;

                debug(message);
                await context.report(resource, null, message);

                return;
            }

            const calculatedGrade: Grades = Grades[grade];
            const calculatedMiniumGrade: Grades = Grades[minimumGrade];

            if (calculatedGrade > calculatedMiniumGrade) {
                const message: string = `${serverName}'s grade ${grade} does not meet the minimum ${minimumGrade} required.`;

                debug(message);
                await context.report(resource, null, message);
            } else {
                debug(`Grade ${grade} for ${resource} is ok.`);
            }
        };

        const notifyError = async (resource: string, error: any) => {
            debug(`Error getting data for ${resource} %O`, error);
            await context.report(resource, null, `Could not get results from SSL Labs for '${resource}'.`);
        };

        const start = async (data: FetchEnd) => {
            const { resource }: { resource: string } = data;

            if (!resource.startsWith('https://')) {
                const message: string = `'${resource}' does not support HTTPS.`;

                debug(message);
                await context.report(resource, null, message);

                return;
            }

            const ssl = await import('node-ssllabs');
            const ssllabs: Function = promisify(ssl.scan);

            debug(`Starting SSL Labs scan for ${resource}`);
            scanOptions.host = resource;

            promise = ssllabs(scanOptions)
                .catch(async (error: any) => {
                    failed = true;
                    await notifyError(resource, error);
                });
        };

        const end = async (data: ScanEnd) => {
            const { resource }: { resource: string } = data;

            if (!promise || failed) {
                return;
            }

            debug(`Waiting for SSL Labs results for ${resource}`);
            let host: SSLLabsResult;

            try {
                host = await promise;
            } catch (e) {
                notifyError(resource, e);

                return;
            }

            debug(`Received SSL Labs results for ${resource}`);

            if (!host || !host.endpoints || host.endpoints.length === 0) {
                const msg = `Didn't get any result for ${resource}.
There might be something wrong with SSL Labs servers.`;

                debug(msg);
                await context.report(resource, null, msg);

                return;
            }

            for (const endpoint of host.endpoints) {
                await verifyEndpoint(resource, endpoint);
            }
        };

        loadHintConfig();

        /*
         * We are using `fetch::end::html` instead of `scan::start`
         * or `fetch::start` because the `ssllabs` API doesn't
         * follow the redirects, so we need to use the final url
         * (e.g.: https://developer.microsoft.com/en-us/microsoft-edge/
         * instead of http://edge.ms).
         */
        context.on('fetch::end::html', start);
        context.on('scan::end', end);
    }
}
