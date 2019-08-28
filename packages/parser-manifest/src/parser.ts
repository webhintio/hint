import {
    ElementFound,
    FetchEnd,
    NetworkData,
    Parser,
    SchemaValidationResult
} from 'hint/dist/src/lib/types';

import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { isHTTP } from '@hint/utils/dist/src/network/is-http';
import { isHTTPS } from '@hint/utils/dist/src/network/is-https';
import { ManifestEvents } from './types';
import { Engine } from 'hint/dist/src/lib/engine';
import { parseJSON } from '@hint/utils/dist/src/json-parser';
import { IJSONResult } from '@hint/utils/dist/src/types/json-parser';
import { validate } from '@hint/utils/dist/src/schema-validation/schema-validator';

export * from './types';

// Using `require` instead of `loadJSONFile` so this can be bundled with `extension-browser`.
const schema = require('./schema.json');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class ManifestParser extends Parser<ManifestEvents> {
    // Event names.

    private readonly fetchEndEventName = 'fetch::end::manifest';
    private readonly fetchErrorEventName = 'fetch::error::manifest';
    private readonly fetchStartEventName = 'fetch::start::manifest';

    private readonly parseEndEventName = 'parse::end::manifest';
    private readonly parseErrorSchemaEventName = 'parse::error::manifest::schema';
    private readonly parseJSONErrorEventName = 'parse::error::manifest::json';

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private fetchedManifests = new Set<string>();

    public constructor(engine: Engine<ManifestEvents>) {
        super(engine, 'manifest');

        engine.on('element::link', this.fetchManifest.bind(this));
        engine.on('fetch::end::manifest', this.validateManifest.bind(this));
        engine.on('scan::end', this.onScanEnd.bind(this));
    }

    private onScanEnd() {
        // Clear cached manifests so multiple runs work (e.g. in local connector).
        this.fetchedManifests.clear();
    }

    private async fetchManifest(elementFound: ElementFound) {
        const { element, resource } = elementFound;

        /*
         * Check if the target is a local file, and if it is,
         * don't try to fetch the web app manifest file as it's
         * `href` value will most probably not map to anything
         * on disk and the request will fail.
         *
         * TODO: Remove this once things work as expected.
         */

        if (!isHTTP(resource) && !isHTTPS(resource)) {
            return;
        }

        // Check if the `link` tag is for the web app manifest.

        if (normalizeString(element.getAttribute('rel')) !== 'manifest') {
            return;
        }

        // If so, check if a non-empty `href` was specified.

        const hrefValue: string | null = normalizeString(element.getAttribute('href'));

        if (!hrefValue) {
            return;
        }

        // Try to fetch the web app manifest.

        const manifestURL: string = element.resolveUrl(hrefValue);

        /*
         * Don't fetch the manifest if it has already been fetched (as some
         * connectors fetch automatically).
         *
         * Note: This expects manifest fetches by a connector to occur first.
         * In theory a redundant fetch can still occur if the connector fetch
         * occurs second. This does not happen in practice as this check runs
         * after the page has been loaded (as part of the DOM traversal phase).
         */
        if (this.fetchedManifests.has(manifestURL)) {
            return;
        }

        await this.engine.emitAsync(this.fetchStartEventName, { resource });

        let manifestNetworkData: NetworkData;

        try {
            manifestNetworkData = await this.engine.fetchContent(manifestURL);
        } catch (error) {

            await this.engine.emitAsync(this.fetchErrorEventName, {
                element,
                error,
                hops: [manifestURL],
                resource: manifestURL
            });

            return;
        }

        // If the web app manifest was fetched successfully and hasn't already been seen.

        if (this.fetchedManifests.has(manifestURL)) {
            return;
        }

        await this.engine.emitAsync(this.fetchEndEventName, {
            element,
            request: manifestNetworkData.request,
            resource: manifestURL,
            response: manifestNetworkData.response
        });
    }

    private async validateManifest(fetchEnd: FetchEnd) {
        const { resource, response } = fetchEnd;

        if (this.fetchedManifests.has(resource)) {
            return;
        }

        this.fetchedManifests.add(resource);

        if (response.statusCode >= 400) {
            return;
        }

        await this.engine.emitAsync(`parse::start::manifest`, { resource });

        let result: IJSONResult;

        /*
         * Try to see if the content of the web app manifest file
         * is a valid JSON.
         */

        try {
            result = parseJSON(response.body.content);
        } catch (e) {

            await this.engine.emitAsync(this.parseJSONErrorEventName, {
                error: e,
                resource
            });

            return;
        }

        /*
         * Try to see if the content of the web app manifest file
         * is a valid acording to the schema.
         */

        const validationResult: SchemaValidationResult = validate(schema, result.data, result.getLocation);

        if (!validationResult.valid) {

            await this.engine.emitAsync(this.parseErrorSchemaEventName, {
                error: new Error('Invalid manifest'),
                errors: validationResult.errors,
                groupedErrors: validationResult.groupedErrors,
                prettifiedErrors: validationResult.prettifiedErrors,
                resource
            });

            return;
        }

        /*
         * If it is, return the parsed content among with
         * other useful information about the manifest.
         */

        await this.engine.emitAsync(this.parseEndEventName, {
            getLocation: result.getLocation,
            parsedContent: validationResult.data,
            resource
        });
    }
}
