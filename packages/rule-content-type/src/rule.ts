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

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IResponse, IRule, IFetchEnd, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { getHeaderValueNormalized, isDataURI, normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { isTextMediaType } from 'sonarwhal/dist/src/lib/utils/content-type';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ContentTypeRule implements IRule {
    private _id: string;

    public get id() {
        return this._id;
    }

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.interoperability,
            description: 'Require `Content-Type` header with appropriate value'
        },
        schema: [{
            items: { type: 'string' },
            type: ['object', null],
            uniqueItems: true
        }],
        scope: RuleScope.site
    }

    public constructor(id: string, context: RuleContext) {

        this._id = id;

        let userDefinedMediaTypes;

        const loadRuleConfigs = () => {
            userDefinedMediaTypes = context.ruleOptions || {};
        };

        const getLastRegexThatMatches = (resource: string): string => {
            const results = (Object.entries(userDefinedMediaTypes).filter(([regex]) => {
                const re = new RegExp(regex, 'i');

                return re.test(resource);
            }))
                .pop();

            return results && (results[1] as string);
        };

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: IResponse } = fetchEnd;

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

        loadRuleConfigs();

        context.on(this.id, 'fetch::end::*', validate);
    }
}
