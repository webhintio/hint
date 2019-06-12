/**
 * @fileoverview Check if responses contain certain disallowed HTTP headers.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from '@hint/utils/dist/src/debug';
import { mergeIgnoreIncludeArrays } from '@hint/utils/dist/src/misc/merge-ignore-include-arrays';
import { prettyPrintArray } from '@hint/utils/dist/src/misc/pretty-print-array';
import { toLowerCaseArray } from '@hint/utils/dist/src/misc/to-lowercase-array';
import { includedHeaders } from '@hint/utils/dist/src/network/included-headers';
import { isDataURI } from '@hint/utils/dist/src/network/is-data-uri';
import { normalizeHeaderValue } from '@hint/utils/dist/src/network/normalize-header-value';

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { FetchEnd, IHint } from 'hint/dist/src/lib/types';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoDisallowedHeadersHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let disallowedHeaders: string[] = [
            'public-key-pins',
            'public-key-pins-report-only',
            'x-aspnet-version',
            'x-aspnetmvc-version',
            'x-powered-by',
            'x-runtime',
            'x-version'
        ];

        let includeHeaders: string[];
        let ignoreHeaders: string[];

        const loadHintConfigs = () => {
            includeHeaders = (context.hintOptions && context.hintOptions.include) || [];
            ignoreHeaders = (context.hintOptions && context.hintOptions.ignore) || [];

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

        const validate = ({ response, resource }: FetchEnd) => {
            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headers: string[] = includedHeaders(response.headers, disallowedHeaders);
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

            const serverHeaderValue = normalizeHeaderValue(response.headers, 'server');
            const codeLanguage = 'http';

            if (!disallowedHeaders.includes('server') &&
                !toLowerCaseArray(ignoreHeaders).includes('server') &&
                serverHeaderValue &&
                serverHeaderContainsTooMuchInformation(serverHeaderValue)
            ) {
                const message = `'server' header value should only contain the server name, not '${(response.headers as any).server}'.`;

                context.report(resource, message, { codeLanguage, codeSnippet: `Server: ${serverHeaderValue}` });
            }

            if (numberOfHeaders > 0) {
                const message = `Response should not include disallowed ${prettyPrintArray(headers)} ${numberOfHeaders === 1 ? 'header' : 'headers'}.`;

                const codeSnippet = headers.reduce((total, header) => {
                    return `${total}${total ? '\n' : ''}${header}: ${normalizeHeaderValue(response.headers, header)}`;
                }, '');

                context.report(resource, message, { codeLanguage, codeSnippet });
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
