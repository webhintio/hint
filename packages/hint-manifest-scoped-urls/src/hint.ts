/**
 * @fileoverview Checks if urls in the manifest are in scope and accessible
 */

import { URL } from 'url';
import { relative } from 'path';
import { IHint, HintContext, NetworkData } from 'hint';
import { ManifestEvents, ManifestParsed, Manifest } from '@hint/parser-manifest';
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
        const startUrlAccessible = async (startUrl: string, resource: string): Promise<boolean> => {
            let networkData: NetworkData;

            try {
                networkData = await context.fetchContent(startUrl);
            } catch (e) {
                debug(`Failed to fetch ${startUrl}`);
                const message = `Request failed for start_url: ${startUrl}`;

                context.report(startUrl, message);

                return false;
            }

            const response = networkData.response;

            if (response.statusCode !== 200) {
                const message = `Specified start_url not accessible. (status code: ${response.statusCode}).`;

                context.report(startUrl, message);

                return false;
            }

            return true;
        };

        /**
         *
         * @param property `property` to be found in the Manifest
         * @param parsedContent Manifest
         * @param resource
         */
        const manifestPropertyFound = (property: string, parsedContent: Manifest, resource: string): boolean => {
            const found = parsedContent.hasOwnProperty(property);

            if (!found) {
                const message = `Property ${property} not found in Manifest file`;

                context.report(resource, message);

                return false;
            }

            return true;
        };

        /**
         * Reports if neither of `name` and `short_name` is specified
         * @param parsedContent
         * @param resource
         */
        const findAppName = (parsedContent: Manifest, resource: string) => {
            const hasName = parsedContent.hasOwnProperty('name') || parsedContent.hasOwnProperty('short_name');

            if (!hasName) {
                manifestPropertyFound('name', parsedContent, resource);
            }
        };

        /**
         * Checks that the `start_url` is under the scope of
         * url specified in the `scope`
         * @param parsedContent
         * @param resource
         */
        const startUrlInScope = (parsedContent: Manifest, resource: string): boolean => {
            const scope = parsedContent.scope || '/';
            const startURL = parsedContent.start_url;
            const relativePath = relative(scope, startURL!);
            const inScope = relativePath && !relativePath.startsWith('..');

            if (relativePath === '') {
                return true;
            }

            if (!inScope) {
                const message = `start_url is not in scope of the app.`;

                context.report(resource, message);

                return false;
            }

            return true;
        };

        const validate = async ({ parsedContent, resource }: ManifestParsed) => {
            const resourceURL = new URL(resource);
            const hostnameWithProtocol = `${resourceURL.protocol}//${resourceURL.host}`;

            debug(`Validating hint manifest-scoped-urls`);

            findAppName(parsedContent, resource);
            const hasStartUrl = manifestPropertyFound('start_url', parsedContent, resource);

            if (hasStartUrl) {
                startUrlInScope(parsedContent, resource);
                const separator = parsedContent.start_url!.startsWith('/') ? '' : '/';
                const fullStartUrl = hostnameWithProtocol + separator + parsedContent.start_url;

                await startUrlAccessible(fullStartUrl, resource);
            }
        };

        context.on('parse::end::manifest', validate);
    }
}
