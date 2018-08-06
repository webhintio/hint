/**
 * @fileoverview Check if non HTML resources responses contain certain
 * unneeded HTTP headers.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { getIncludedHeaders, mergeIgnoreIncludeArrays } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { IAsyncHTMLElement, FetchEnd, Response, IHint, HintMetadata } from 'hint/dist/src/lib/types';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import prettyPrintArray from 'hint/dist/src/lib/utils/misc/pretty-print-array';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoHtmlOnlyHeadersHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.performance,
            description: 'Disallow unneeded HTTP headers for non-HTML resources'
        },
        id: 'no-html-only-headers',
        schema: [{
            additionalProperties: false,
            definitions: {
                'string-array': {
                    items: { type: 'string' },
                    minItems: 1,
                    type: 'array',
                    uniqueItems: true
                }
            },
            properties: {
                ignore: { $ref: '#/definitions/string-array' },
                include: { $ref: '#/definitions/string-array' }
            },
            type: ['object', 'null']
        }],
        scope: HintScope.site
    }

    public constructor(context: HintContext) {

        let unneededHeaders: Array<string> = [
            'content-security-policy',
            'feature-policy',
            'x-content-security-policy',
            'x-frame-options',
            'x-ua-compatible',
            'x-webkit-csp',
            'x-xss-protection'
        ];

        const loadHintConfigs = () => {
            const includeHeaders = (context.hintOptions && context.hintOptions.include) || [];
            const ignoreHeaders = (context.hintOptions && context.hintOptions.ignore) || [];

            unneededHeaders = mergeIgnoreIncludeArrays(unneededHeaders, ignoreHeaders, includeHeaders);
        };

        const willBeTreatedAsHTML = (response: Response): boolean => {
            const contentTypeHeader: string = response.headers['content-type'];
            const mediaType: string = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : '';

            /*
             * By default, browsers will treat resource sent with the
             * following media types as HTML documents.
             */

            if ([
                'text/html',
                'application/xhtml+xml'
            ].includes(mediaType)) {
                return true;
            }

            /*
             * That is not the situation for other cases where the media
             * type is in the form of `<type>/<subtype>`.
             */

            if (mediaType.indexOf('/') > 0) {
                return false;
            }

            /*
             * If the media type is not specified or invalid, browser
             * will try to sniff the content.
             *
             * https://mimesniff.spec.whatwg.org/
             *
             * At this point, even if browsers may decide to treat
             * the content as a HTML document, things are obviously
             * not done correctly, so the decision was to not try to
             * also sniff the content, and instead, just signal this
             * as a problem.
             */

            return false;
        };

        const validate = async (fetchEnd: FetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: Response } = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            if (!willBeTreatedAsHTML(response)) {
                const headers: Array<string> = getIncludedHeaders(response.headers, unneededHeaders);
                const numberOfHeaders: number = headers.length;

                if (numberOfHeaders > 0) {
                    await context.report(resource, element, `Response should not include unneeded ${prettyPrintArray(headers)} ${numberOfHeaders === 1 ? 'header' : 'headers'}.`);
                }
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
