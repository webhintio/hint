/**
 * @fileoverview Checks if URLs in the manifest are in scope and accessible
 */

import { URL } from 'url';
import { relative } from 'path';
import { IHint, HintContext, NetworkData, ProblemLocation } from 'hint';
import { ManifestEvents, ManifestParsed } from '@hint/parser-manifest';
import { debug as d } from '@hint/utils';

import meta from './meta';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestScopedUrlsHint implements IHint {
    public static readonly meta = meta;
    public constructor(context: HintContext<ManifestEvents>) {
        /**
         * See if the `start_url` is accessible.
         */
        const startUrlAccessible = async (startUrl: string, resource: string, startUrllocation: ProblemLocation): Promise<boolean> => {
            let networkData: NetworkData;

            try {
                networkData = await context.fetchContent(startUrl);
            } catch (e) {
                debug(`Failed to fetch ${startUrl}`);
                const message = `Request failed for 'start_url'`;

                context.report(resource, message, { location: startUrllocation });

                return false;
            }

            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = `Specified 'start_url' is not accessible. (status code: ${response.statusCode}).`;

                context.report(resource, message, { location: startUrllocation });

                return false;
            }

            return true;
        };

        /**
         * Checks that the `start_url` is under the scope of
         * the URL specified in the `scope`
         * @param parsedContent
         * @param resource
         */
        const startUrlInScope = (startURL: string, scope: string, resource: string, startUrllocation: ProblemLocation): boolean => {
            const relativePath = relative(scope, startURL);
            const inScope = relativePath && !relativePath.startsWith('..');

            if (relativePath === '') {
                return true;
            }

            if (!inScope) {
                const message = `'start_url' is not in scope of the app.`;

                context.report(resource, message, { location: startUrllocation });

                return false;
            }

            return true;
        };

        const validate = async ({ getLocation, parsedContent: { start_url: startURL, scope }, resource }: ManifestParsed) => {
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${resourceURL.host}`;

            debug(`Validating hint manifest-scoped-urls`);

            if (startURL) {
                const startUrlLocation = getLocation('start_url')!;
                const notSameOrigin = startURL.startsWith('http://') || startURL.startsWith('https://');
                const computedScope = scope || `${resource}/`;

                if (notSameOrigin) {
                    const message = `'start_url' must have same origin as the manifest file.`;

                    context.report(resource, message, { location: startUrlLocation });

                    return;
                }

                startUrlInScope(startURL, computedScope, resource, startUrlLocation);
                const separator = startURL.startsWith('/') ? '' : '/';
                const absoluteStartUrl = hostnameWithProtocol + separator + startURL;

                await startUrlAccessible(absoluteStartUrl, resource, startUrlLocation);
            } else {
                const message = `Property 'start_url' not found in manifest file`;

                context.report(resource, message);
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
