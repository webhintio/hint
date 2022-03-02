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

import { debug as d } from '@hint/utils-debug';
import { normalizeString } from '@hint/utils-string';
import { isDataURI, normalizeHeaderValue } from '@hint/utils-network';
import { IHint, FetchEnd } from 'hint/dist/src/lib/types';
import { isTextMediaType } from '@hint/utils/dist/src/content-type';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ContentTypeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let userDefinedMediaTypes: { [regex: string]: string };

        const loadHintConfigs = () => {
            userDefinedMediaTypes = context.hintOptions || {};
        };

        const getLastRegexThatMatches = (resource: string): string | undefined => {
            const results = (Object.entries(userDefinedMediaTypes).filter(([regex]) => {
                const re = new RegExp(regex, 'i');

                return re.test(resource);
            }))
                .pop();

            return results && results[1];
        };

        const validate = ({ resource, response }: FetchEnd) => {
            if (response.statusCode !== 200) {
                debug('Check does not apply to status code !== 200');

                return;
            }

            // This check does not make sense for data URIs.
            if (isDataURI(resource)) {
                debug('Check does not apply for data URIs');

                return;
            }

            const contentTypeHeaderValue = normalizeHeaderValue(response.headers, 'content-type');
            const noSniff = normalizeHeaderValue(response.headers, 'x-content-type-options') === 'no-sniff';
            const severity = noSniff ? Severity.error : Severity.warning;
            const codeSnippet = `Content-Type: ${contentTypeHeaderValue}`;
            const codeLanguage = 'http';

            // Check if the `Content-Type` header was sent.

            if (contentTypeHeaderValue === null) {

                context.report(
                    resource,
                    getMessage('responseShouldIncludeContentType', context.language),
                    { severity }
                );

                return;
            }

            /*
             * If the current resource matches any of the regexes
             * defined by the user, use that value to validate.
             */

            const userDefinedMediaType: string | undefined = getLastRegexThatMatches(resource);

            if (userDefinedMediaType) {
                if (normalizeString(userDefinedMediaType) !== contentTypeHeaderValue) {
                    context.report(
                        resource,
                        getMessage('contentTypeValueShouldBe', context.language, userDefinedMediaType),
                        { codeLanguage, codeSnippet, severity }
                    );
                }

                return;
            }

            // Check if the `Content-Type` value is valid.

            let contentType: MediaType;

            try {
                if (contentTypeHeaderValue === '') {
                    throw new TypeError(getMessage('invalidMediaType', context.language));
                }

                contentType = parse(contentTypeHeaderValue);
            } catch (e) {
                context.report(
                    resource,
                    getMessage('contentTypeValueInvalid', context.language, (e as Error).message),
                    { codeLanguage, codeSnippet, severity }
                );

                return;
            }

            const originalCharset: string | null = normalizeString(contentType.parameters ? contentType.parameters.charset : '');
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
             * Allow `application/javascript` for JavaScript resources.
             * See https://github.com/webhintio/hint/issues/2621
             */
            const allowApplicationJavaScript = mediaType === 'text/javascript' && originalMediaType === 'application/javascript';

            /*
             * Allow `image/vnd.microsoft.icon` for .ico resources.
             * See https://stackoverflow.com/questions/13827325/correct-mime-type-for-favicon-ico
             */
            const allowImageVndMicrosoftIcon = mediaType === 'image/x-icon' && originalMediaType === 'image/vnd.microsoft.icon';

            /*
             * Check if the determined values differ
             * from the ones from the `Content-Type` header.
             */

            // * media type

            if (mediaType && mediaType !== originalMediaType && !allowApplicationJavaScript && !allowImageVndMicrosoftIcon) {
                context.report(
                    resource,
                    getMessage('contentTypeValueShoudBeNot', context.language, [mediaType, originalMediaType]),
                    { codeLanguage, codeSnippet, severity }
                );
            }

            // * charset value

            if (charset) {
                if (!originalCharset || (charset !== originalCharset)) {
                    const message: string = originalCharset ?
                        getMessage('contentTypeCharsetShouldBeNot', context.language, [charset, originalCharset]) :
                        getMessage('contentTypeCharsetShouldBe', context.language, charset);

                    context.report(resource, message, { codeLanguage, codeSnippet, severity: Severity.warning });
                }
            } else if (originalCharset &&
                ![
                    'text/html',
                    'application/xhtml+xml'
                ].includes(originalMediaType)) {
                context.report(
                    resource,
                    getMessage('contentTypeValueShouldNotContaint', context.language, originalCharset),
                    { codeLanguage, codeSnippet, severity: Severity.warning }
                );
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
