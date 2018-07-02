/**
 * @fileoverview Check the usage of the `Content-Type` HTTP response
 * header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { MediaType, parse } from 'content-type';

import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, Response, IHint, FetchEnd, HintMetadata } from 'hint/dist/src/lib/types';
import getHeaderValueNormalized from 'hint/dist/src/lib/utils/network/normalized-header-value';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { isTextMediaType } from 'hint/dist/src/lib/utils/content-type';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ContentTypeHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: 'Require `Content-Type` header with appropriate value'
        },
        id: 'content-type',
        schema: [{
            items: { type: 'string' },
            type: ['object', 'null'],
            uniqueItems: true
        }],
        scope: HintScope.site
    }

    public constructor(context: HintContext) {

        let userDefinedMediaTypes;

        const loadHintConfigs = () => {
            userDefinedMediaTypes = context.hintOptions || {};
        };

        const getLastRegexThatMatches = (resource: string): string => {
            const results = (Object.entries(userDefinedMediaTypes).filter(([regex]) => {
                const re = new RegExp(regex, 'i');

                return re.test(resource);
            }))
                .pop();

            return results && (results[1] as string);
        };

        const validate = async (fetchEnd: FetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: Response } = fetchEnd;

            // This check does not make sense for data URIs.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URIs`);

                return;
            }

            const contentTypeHeaderValue: string = getHeaderValueNormalized(response.headers, 'content-type');

            // Check if the `Content-Type` header was sent.

            if (contentTypeHeaderValue === null) {
                await context.report(resource, element, `'content-type' header was not specified`);

                return;
            }

            /*
             * If the current resource matches any of the regexes
             * defined by the user, use that value to validate.
             */

            const userDefinedMediaType: string = getLastRegexThatMatches(resource);

            if (userDefinedMediaType) {
                if (normalizeString(userDefinedMediaType) !== contentTypeHeaderValue) {
                    await context.report(resource, element, `'content-type' header should have the value '${userDefinedMediaType}'`);
                }

                return;
            }

            // Check if the `Content-Type` value is valid.

            let contentType: MediaType;

            try {
                if (contentTypeHeaderValue === '') {
                    throw new TypeError('invalid media type');
                }

                contentType = parse(contentTypeHeaderValue);
            } catch (e) {
                await context.report(resource, element, `'content-type' header value is invalid (${e.message})`);

                return;
            }

            const originalCharset: string = normalizeString(contentType.parameters.charset);
            const originalMediaType: string = contentType.type;

            /*
             * Determined values
             *
             * Notes:
             *
             *  * The connectors already did all the heavy lifting here.
             *  * For the charset, recommend `utf-8` for all text based
             *    bases documents.
             */

            const mediaType: string = response.mediaType;
            const charset: string = isTextMediaType(mediaType) ? 'utf-8' : response.charset;

            /*
             * Check if the determined values differ
             * from the ones from the `Content-Type` header.
             */

            // * media type

            if (mediaType && (mediaType !== originalMediaType)) {
                await context.report(resource, element, `'content-type' header should have media type '${mediaType}' (not '${originalMediaType}')`);
            }

            // * charset value

            if (charset) {
                if (!originalCharset || (charset !== originalCharset)) {
                    await context.report(resource, element, `'content-type' header should have 'charset=${charset}'${originalCharset ? ` (not '${originalCharset}')` : ''}`);
                }
            } else if (originalCharset && !['text/html', 'application/xhtml+xml'].includes(originalMediaType)) {
                await context.report(resource, element, `'content-type' header should not have 'charset=${originalCharset}'`);
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
