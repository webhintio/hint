/**
 * @fileoverview Check if non HTML resources responses contain certain
 * unneeded HTTP headers.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as pluralize from 'pluralize';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { getIncludedHeaders, mergeIgnoreIncludeArrays } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { IAsyncHTMLElement, IFetchEnd, IResponse, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { isDataURI } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoHtmlOnlyHeadersRule implements IRule {

    public static readonly meta: RuleMetadata = {
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
            type: ['object', null]
        }],
        scope: RuleScope.site
    }

    public constructor(context: RuleContext) {

        let unneededHeaders: Array<string> = [
            'content-security-policy',
            'x-content-security-policy',
            'x-frame-options',
            'x-ua-compatible',
            'x-webkit-csp',
            'x-xss-protection'
        ];

        const loadRuleConfigs = () => {
            const includeHeaders = (context.ruleOptions && context.ruleOptions.include) || [];
            const ignoreHeaders = (context.ruleOptions && context.ruleOptions.ignore) || [];

            unneededHeaders = mergeIgnoreIncludeArrays(unneededHeaders, ignoreHeaders, includeHeaders);
        };

        const willBeTreatedAsHTML = (response: IResponse): boolean => {
            const contentTypeHeader: string = response.headers['content-type'];
            const mediaType: string = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : '';

            /*
             * By default, browsers will treat resource sent with the
             * following media types as HTML documents.
             */

            if (['text/html', 'application/xhtml+xml'].includes(mediaType)) {
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

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement, resource: string, response: IResponse } = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            if (!willBeTreatedAsHTML(response)) {
                const headers: Array<string> = getIncludedHeaders(response.headers, unneededHeaders);
                const numberOfHeaders: number = headers.length;

                if (numberOfHeaders > 0) {
                    await context.report(resource, element, `'${headers.join('\', \'')}' ${pluralize('header', numberOfHeaders)} ${pluralize('is', numberOfHeaders)} not needed`);
                }
            }
        };

        loadRuleConfigs();

        context.on('fetch::end::*', validate);
    }
}
