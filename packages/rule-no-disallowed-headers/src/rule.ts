/**
 * @fileoverview Check if responses contain certain disallowed HTTP headers.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as pluralize from 'pluralize';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { getIncludedHeaders, mergeIgnoreIncludeArrays, toLowerCase } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { IAsyncHTMLElement, IFetchEnd, IRule, IRuleBuilder } from 'sonarwhal/dist/src/lib/types';
import { IResponse } from 'sonarwhal/dist/src/lib/types/network';
import { getHeaderValueNormalized, isDataURI } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { Scope } from 'sonarwhal/dist/src/lib/enums/scope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let disallowedHeaders: Array<string> = [
            'public-key-pins',
            'public-key-pins-report-only',
            'x-aspnet-version',
            'x-aspnetmvc-version',
            'x-powered-by',
            'x-runtime',
            'x-version'
        ];

        let includeHeaders;
        let ignoreHeaders;

        const loadRuleConfigs = () => {
            includeHeaders = (context.ruleOptions && context.ruleOptions.include) || [];
            ignoreHeaders = (context.ruleOptions && context.ruleOptions.ignore) || [];

            disallowedHeaders = mergeIgnoreIncludeArrays(disallowedHeaders, ignoreHeaders, includeHeaders);
        };

        const serverHeaderContainsTooMuchInformation = (serverHeaderValue: string): boolean => {

            const regex = [
                /*
                 * Version numbers.
                 *
                 * e.g.:
                 *
                 *   apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6
                 *   marrakesh 1.9.9
                 *   omniture dc/2.0.0
                 *   microsoft-iis/8.5
                 *   pingmatch/v2.0.30-165-g51bed16#rel-ec2-master i-077d449239c04b184@us-west-2b@dxedge-app_us-west-2_prod_asg
                 */

                /\/?v?\d\.(\d+\.?)*/,

                /*
                 * OS/platforms names (usually enclose between parentheses).
                 *
                 * e.g.:
                 *
                 *  apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6
                 *  apache/2.2.34 (amazon)
                 *  nginx/1.4.6 (ubuntu)
                 */

                /\(.*\)/,

                /*
                 * Compiled-in modules.
                 *
                 * e.g.:
                 *
                 *  apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6
                 *  apache/2.4.6 (centos) php/5.4.16
                 *  jino.ru/mod_pizza
                 */

                /(mod_|openssl|php)/
            ];

            return regex.some((r) => {
                return r.test(serverHeaderValue);
            });
        };

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, response, resource }: { element: IAsyncHTMLElement, response: IResponse, resource: string } = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headers: Array<string> = getIncludedHeaders(response.headers, disallowedHeaders);
            const numberOfHeaders: number = headers.length;

            /*
             * If the response contains the `server` header, and
             * `server` is not specified by the user as a disallowed
             * header or a header to be ignored, check if it provides
             * more information than it should.
             *
             * The `Server` header is treated differently than the
             * other ones because it cannot always be remove. In some
             * cases such as Apache the best that the user can do is
             * limit it's value to the name of the server (i.e. apache).
             *
             * See also:
             *
             *  * https://bz.apache.org/bugzilla/show_bug.cgi?id=40026
             *  * https://httpd.apache.org/docs/current/mod/core.html#servertokens
             */

            const serverHeaderValue = getHeaderValueNormalized(response.headers, 'server');

            if (!disallowedHeaders.includes('server') &&
                !toLowerCase(ignoreHeaders).includes('server') &&
                serverHeaderValue &&
                serverHeaderContainsTooMuchInformation(serverHeaderValue)) {
                await context.report(resource, element, `'Server' header value contains more than the server name`);
            }

            if (numberOfHeaders > 0) {
                await context.report(resource, element, `'${headers.join('\', \'')}' ${pluralize('header', numberOfHeaders)} ${pluralize('is', numberOfHeaders)} disallowed`);
            }
        };

        loadRuleConfigs();

        return {
            'fetch::end': validate,
            'manifestfetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: Category.security,
            description: 'Disallow certain HTTP response headers'
        },
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
        scope: Scope.site
    }
};

module.exports = rule;
