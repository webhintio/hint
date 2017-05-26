/**
 * @fileoverview Check if non HTML resources responses contain certain
 * unneeded HTTP headers.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { getIncludedHeaders, mergeIgnoreIncludeArrays } from '../../utils/rule-helpers';
import { IFetchEndEvent, IResponse, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let unneededHeaders = [
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

        const willBeTreatedAsHTML = (response: IResponse) => {
            const contentTypeHeader = response.headers['content-type'];
            const mediaType = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : '';

            // By default, browsers will treat resource sent with the
            // following media types as HTML documents.

            if (['text/html', 'application/xhtml+xml'].includes(mediaType)) {
                return true;
            }

            // That is not the situation for other cases where the media
            // type is in the form of `<type>/<subtype>`.

            if (mediaType.indexOf('/') > 0) {
                return false;
            }

            // If the media type is not specified or invalid, browser
            // will try to sniff the content.
            //
            // https://mimesniff.spec.whatwg.org/
            //
            // At this point, even if browsers may decide to treat
            // the content as a HTML document, things are obviously
            // not done correctly, so the decision was to not try to
            // also sniff the content, and instead, just signal this
            // as a problem.

            return false;
        };

        const checkHeaders = async (fetchEnd: IFetchEndEvent) => {
            const { element, resource, response } = fetchEnd;

            if (!willBeTreatedAsHTML(response)) {
                const headers = getIncludedHeaders(response.headers, unneededHeaders);

                if (headers.length > 0) {
                    await context.report(resource, element, `Unneeded HTTP header${headers.length > 1 ? 's' : ''} found: ${headers.join(', ')}`);
                }
            }
        };

        loadRuleConfigs();

        return {
            'fetch::end': checkHeaders,
            'targetfetch::end': checkHeaders
        };
    },
    meta: {
        docs: {
            category: 'performance',
            description: 'Disallow unneeded HTTP headers for non-HTML resources'
        },
        fixable: 'code',
        recommended: true,
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
        worksWithLocalFiles: false
    }
};

module.exports = rule;
