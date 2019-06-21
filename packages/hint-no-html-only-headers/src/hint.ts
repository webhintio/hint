/**
 * @fileoverview Check if non HTML resources responses contain certain
 * unneeded HTTP headers.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from '@hint/utils/dist/src/debug';
import { includedHeaders } from '@hint/utils/dist/src/network/included-headers';
import { isDataURI } from '@hint/utils/dist/src/network/is-data-uri';
import { mergeIgnoreIncludeArrays } from '@hint/utils/dist/src/misc/merge-ignore-include-arrays';
import { prettyPrintArray } from '@hint/utils/dist/src/misc/pretty-print-array';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { FetchEnd, Response, IHint } from 'hint/dist/src/lib/types';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoHtmlOnlyHeadersHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let unneededHeaders = [
            'content-security-policy',
            'feature-policy',
            'x-content-security-policy',
            'x-ua-compatible',
            'x-webkit-csp',
            'x-xss-protection'
        ];

        // TODO: Remove once https://github.com/webhintio/hint/issues/25 is implemented.
        const exceptionHeaders = [
            'content-security-policy',
            'x-content-security-policy',
            'x-webkit-csp'
        ];

        // TODO: Remove once https://github.com/webhintio/hint/issues/25 is implemented.
        const exceptionMediaTypes = [
            'application/pdf',
            'image/svg+xml',
            'text/javascript'
        ];

        const loadHintConfigs = () => {
            const includeHeaders = (context.hintOptions && context.hintOptions.include) || [];
            const ignoreHeaders = (context.hintOptions && context.hintOptions.ignore) || [];

            unneededHeaders = mergeIgnoreIncludeArrays(unneededHeaders, ignoreHeaders, includeHeaders);
        };

        const willBeTreatedAsHTML = (response: Response): boolean => {
            const contentTypeHeader = response.headers['content-type'];
            const mediaType = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : '';

            /*
             * By default, browsers will treat resource sent with the
             * following media types as HTML documents.
             */

            if ([
                'text/html',
                'text/xml',
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

        const validate = ({ element, resource, response }: FetchEnd) => {
            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            if (!willBeTreatedAsHTML(response)) {
                let headersToValidate = unneededHeaders;

                if (exceptionMediaTypes.includes(response.mediaType)) {
                    headersToValidate = mergeIgnoreIncludeArrays(headersToValidate, exceptionHeaders, []);
                }
                const headers = includedHeaders(response.headers, headersToValidate);
                const numberOfHeaders = headers.length;

                if (numberOfHeaders > 0) {
                    const message = `Response should not include unneeded ${prettyPrintArray(headers)} ${numberOfHeaders === 1 ? 'header' : 'headers'}.`;

                    context.report(resource, message, { element });
                }
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
