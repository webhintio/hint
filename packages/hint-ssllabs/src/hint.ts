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

import { debug as d } from '@hint/utils';
import { FetchEnd, HintContext, IHint, ScanEnd } from 'hint';
import { Grades, SSLLabsEndpoint, SSLLabsOptions, SSLLabsResult } from './types';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class SSLLabsHint implements IHint {

    public static readonly meta = meta;

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

        const verifyEndpoint = (resource: string, { grade, serverName = resource, details }: SSLLabsEndpoint) => {
            if (!grade && details.protocols.length === 0) {
                const message = getMessage('doesNotSupportHTTPS', context.language, resource);

                debug(message);
                context.report(resource, message);

                return;
            }

            const calculatedGrade: Grades = Grades[grade];
            const calculatedMiniumGrade: Grades = Grades[minimumGrade];

            if (calculatedGrade > calculatedMiniumGrade) {
                const message: string = getMessage('gradeNotMeetTheMinimum', context.language, [serverName, grade, minimumGrade]);

                debug(message);
                context.report(resource, message);
            } else {
                debug(getMessage('gradeOk', context.language, [grade, resource]));
            }
        };

        const notifyError = (resource: string, error: any) => {
            debug(getMessage('errorGettingData', context.language, [resource, JSON.stringify(error)]));
            context.report(resource, getMessage('couldNotGetResults', context.language, resource));
        };

        const start = async ({ resource }: FetchEnd) => {
            if (!resource.startsWith('https://')) {
                const message: string = getMessage('doesNotSupportHTTPS', context.language, resource);

                debug(message);
                context.report(resource, message);

                return;
            }

            const ssl = await import('node-ssllabs');
            const ssllabs: Function = promisify(ssl.scan);

            debug(getMessage('startingScan', context.language, resource));
            scanOptions.host = resource;

            promise = ssllabs(scanOptions)
                .catch((error: any) => {
                    failed = true;
                    notifyError(resource, error);
                });
        };

        const end = async ({ resource }: ScanEnd) => {
            if (!promise || failed) {
                return;
            }

            debug(getMessage('waitingForSSL', context.language, resource));
            let host: SSLLabsResult;

            try {
                host = await promise;
            } catch (e) {
                notifyError(resource, e);

                return;
            }

            debug(getMessage('receivedResult', context.language, resource));

            if (!host || !host.endpoints || host.endpoints.length === 0) {
                const msg = getMessage('noResults', context.language, resource);

                debug(msg);
                context.report(resource, msg);

                return;
            }

            host.endpoints.forEach((endpoint) => {
                verifyEndpoint(resource, endpoint);
            });
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
