import * as path from 'path';
import { URL } from 'url';

import {
    ElementFound,
    FetchEnd,
    FetchError,
    FetchStart,
    NetworkData,
    Parser
} from 'sonarwhal/dist/src/lib/types';
import {
    isHTTP,
    isHTTPS,
    loadJSONFile,
    normalizeString
} from 'sonarwhal/dist/src/lib/utils/misc';
import {
    ManifestInvalidJSON,
    ManifestInvalidSchema,
    ManifestParsed
} from './types';
import { SchemaValidationResult } from 'sonarwhal/dist/src/lib/types/schema-validation-result';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { validate } from 'sonarwhal/dist/src/lib/utils/schema-validator';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class ManifestParser extends Parser {

    // Event names.

    private fetchEndEventName = 'fetch::end::manifest';
    private fetchErrorEventName = 'fetch::error::manifest';
    private fetchStartEventName = 'fetch::start::manifest';

    /* eslint-disable no-invalid-this */
    private parseEventPrefix = 'parse::manifest';
    private parseEndEventName: string = `${this.parseEventPrefix}::end`;
    private parseErrorSchemaEventName: string = `${this.parseEventPrefix}::error::schema`;
    private parseJSONErrorEventName: string = `${this.parseEventPrefix}::error::json`;
    /* eslint-enable no-invalid-this */

    // Other.

    private schema: any;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal, 'manifest');

        this.schema = loadJSONFile(path.join(__dirname, 'schema.json'));

        sonarwhal.on('element::link', this.fetchManifest.bind(this));
        sonarwhal.on('fetch::end::manifest', this.validateManifest.bind(this));
    }

    private async fetchManifest (elementFound: ElementFound) {
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

        const hrefValue: string = normalizeString(element.getAttribute('href'));

        if (!hrefValue) {
            return;
        }

        // Try to fetch the web app manifest.

        const manifestURL: string = (new URL(hrefValue, resource)).href;
        const fetchStartEvent: FetchStart = { resource };

        await this.sonarwhal.emitAsync(this.fetchStartEventName, fetchStartEvent);

        let manifestNetworkData: NetworkData;
        let error: Error;

        try {
            manifestNetworkData = await this.sonarwhal.fetchContent(manifestURL, null);
        } catch (e) {
            error = e;

            /*
             * Generic error message is used as it would be complicated
             * to handle all the cases, and displaying the default error
             * message wouldn't be very user friendly.
             */

            error.message = `File could not be fetched`;
        }

        // TODO: Add check if manifest cannot be fetch because of CSP.

        const statusCode: number = manifestNetworkData && manifestNetworkData.response.statusCode;

        if (error || statusCode !== 200) {
            const fetchErrorEvent: FetchError = {
                element,
                error: error || new Error(`File could not be fetched (status code: ${statusCode})`),
                hops: (manifestNetworkData && manifestNetworkData.response.hops) || [manifestURL],
                resource
            };

            await this.sonarwhal.emitAsync(this.fetchErrorEventName, fetchErrorEvent);

            return;
        }

        // If the web app manifest was fetch successfully.

        const fetchEndEvent: FetchEnd = {
            element,
            request: manifestNetworkData.request,
            resource,
            response: manifestNetworkData.response
        };

        await this.sonarwhal.emitAsync(this.fetchEndEventName, fetchEndEvent);
    }

    private async validateManifest (fetchEnd: FetchEnd) {
        const { element, resource, response, request } = fetchEnd;

        let jsonContent = '';

        /*
         * Try to see if the content of the web app manifest file
         * is a valid JSON.
         */

        try {
            jsonContent = JSON.parse(response.body.content);
        } catch (e) {
            const manifestInvalidJSONEvent: ManifestInvalidJSON = {
                element,
                error: e,
                request,
                resource,
                response
            };

            await this.sonarwhal.emitAsync(this.parseJSONErrorEventName, manifestInvalidJSONEvent);

            return;
        }

        /*
         * Try to see if the content of the web app manifest file
         * is a valid acording to the schema.
         */

        const validationResult: SchemaValidationResult = validate(this.schema, jsonContent);

        if (!validationResult.valid) {
            const manifestInvalidSchemaEvent: ManifestInvalidSchema = {
                element,
                errors: validationResult.errors,
                prettifiedErrors: validationResult.prettifiedErrors,
                request,
                resource,
                response
            };

            await this.sonarwhal.emitAsync(this.parseErrorSchemaEventName, manifestInvalidSchemaEvent);

            return;
        }

        /*
         * If it is, return the parsed content among with
         * other useful information about the manifest.
         */

        const manifestParserEvent: ManifestParsed = {
            element,
            parsedContent: validationResult.data,
            request,
            resource,
            response
        };

        await this.sonarwhal.emitAsync(this.parseEndEventName, manifestParserEvent);
    }
}
