import { URL } from 'url';

import {
    ElementFound,
    FetchEnd,
    IJSONResult,
    NetworkData,
    Parser,
    SchemaValidationResult
} from 'hint/dist/src/lib/types';

import isHTTP from 'hint/dist/src/lib/utils/network/is-http';
import isHTTPS from 'hint/dist/src/lib/utils/network/is-https';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';

import { ManifestEvents } from './types';
import { Engine } from 'hint/dist/src/lib/engine';
import { parseJSON } from 'hint/dist/src/lib/utils/json-parser';
import { validate } from 'hint/dist/src/lib/utils/schema-validator';

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

    public constructor(engine: Engine<ManifestEvents>) {
        super(engine, 'manifest');

        engine.on('element::link', this.fetchManifest.bind(this));
        engine.on('fetch::end::manifest', this.validateManifest.bind(this));
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

        const manifestURL: string = (new URL(hrefValue, resource)).href;

        await this.engine.emitAsync(this.fetchStartEventName, { resource });

        let manifestNetworkData: NetworkData | undefined;
        let error: Error | undefined;

        try {
            manifestNetworkData = await this.engine.fetchContent(manifestURL);
        } catch (e) {
            error = e as Error;

            /*
             * Generic error message is used as it would be complicated
             * to handle all the cases, and displaying the default error
             * message wouldn't be very user friendly.
             */

            error.message = `'${hrefValue}' could not be fetched (request failed).`;
        }

        // TODO: Add check if manifest cannot be fetch because of CSP.

        const statusCode: number | undefined = manifestNetworkData && manifestNetworkData.response.statusCode;

        if (!manifestNetworkData || error || statusCode !== 200) {

            await this.engine.emitAsync(this.fetchErrorEventName, {
                element,
                error: error || new Error(`'${hrefValue}' could not be fetched (status code: ${statusCode}).`),
                hops: (manifestNetworkData && manifestNetworkData.response.hops) || [manifestURL],
                resource: manifestURL
            });

            return;
        }

        // If the web app manifest was fetch successfully.

        await this.engine.emitAsync(this.fetchEndEventName, {
            element,
            request: manifestNetworkData.request,
            resource: manifestURL,
            response: manifestNetworkData.response
        });
    }

    private async validateManifest(fetchEnd: FetchEnd) {
        const { resource, response } = fetchEnd;

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
