/**
 * @fileoverview Check the usage of the `Content-Type` HTTP response
 * header.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';

import * as fileType from 'file-type';
import * as isSvg from 'is-svg';
import * as mimeDB from 'mime-db';
import { parse } from 'content-type';

import { IAsyncHTMLElement, IResponseBody, IRule, IRuleBuilder, IFetchEndEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let userDefinedMediaTypes;

        const loadRuleConfigs = () => {
            userDefinedMediaTypes = context.ruleOptions || {};
        };

        const getMediaTypeBasedOnFileExtension = (fileExtension: string) => {
            return fileExtension && Object.keys(mimeDB).find((key) => {
                return mimeDB[key].extensions && mimeDB[key].extensions.includes(fileExtension);
            });
        };

        const getLastRegexThatMatches = (resource: string) => {
            const results = (Object.entries(userDefinedMediaTypes).filter(([regex]) => {
                const re = new RegExp(regex, 'i');

                return re.test(resource);
            }))
                .pop();

            return results && results[1];
        };

        const determineMediaTypeForScript = (element: IAsyncHTMLElement) => {
            const typeAttribute = (element.getAttribute('type') || '').toLowerCase().trim();

            // Valid JavaScript media types:
            // https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type

            const validJavaScriptMediaTypes = [
                'application/ecmascript',
                'application/javascript',
                'application/x-ecmascript',
                'application/x-javascript',
                'text/ecmascript',
                'text/javascript',
                'text/javascript1.0',
                'text/javascript1.1',
                'text/javascript1.2',
                'text/javascript1.3',
                'text/javascript1.4',
                'text/javascript1.5',
                'text/jscript',
                'text/livescript',
                'text/x-ecmascript',
                'text/x-javascript'
            ];

            // If the type attribute is:
            //
            //  * omitted (doesn't have a value, or is an empty string)
            //  * set to one of the valid JavaScript media types
            //  * 'module'
            //
            // it means the content is not intended as an data block,
            // and the official JavaScript media type can be suggested.
            //
            // See: https://html.spec.whatwg.org/multipage/scripting.html#attr-script-type

            if (!typeAttribute ||
                validJavaScriptMediaTypes.includes(typeAttribute) ||
                typeAttribute === 'module') {
                return 'application/javascript';
            }

            return null;
        };

        const determineMediaTypeBasedOnElement = (element: IAsyncHTMLElement) => {
            const nodeName = element && element.nodeName.toLowerCase();

            if (nodeName) {

                if (nodeName === 'script') {
                    return determineMediaTypeForScript(element);
                }

                if (nodeName === 'link') {
                    const relValue = element.getAttribute('rel');

                    /* eslint-disable default-case */
                    switch (relValue) {
                        case 'stylesheet':
                            // https://html.spec.whatwg.org/multipage/semantics.html#processing-the-type-attribute
                            return 'text/css';
                        case 'manifest':
                            return 'application/manifest+json';
                    }
                    /* eslint-enable no-default */
                }
            }

            return null;
        };

        const determineMediaTypeBasedOnFileExtension = (resource: string) => {
            const fileExtension = path.extname(resource).split('.')
                                                        .pop();

            return getMediaTypeBasedOnFileExtension(fileExtension);
        };

        const determineMediaTypeBasedOnFileType = (rawContent: Buffer) => {
            const detectedFileType = fileType(rawContent);

            if (detectedFileType) {
                // Use the media types from `mime-db`, not `file-type`.
                return getMediaTypeBasedOnFileExtension(detectedFileType.ext);
            }

            if (isSvg(rawContent)) {
                return getMediaTypeBasedOnFileExtension('svg');
            }

            return null;
        };

        const validate = async (fetchEnd: IFetchEndEvent) => {
            const { element, resource, response } = fetchEnd;
            const contentTypeHeaderValue = response.headers['content-type'];

            // Check if the `Content-Type` header was sent.

            if (typeof contentTypeHeaderValue === 'undefined') {
                await context.report(resource, element, `'Content-Type' header was not specified`);

                return;
            }

            // If the current resource matches any of the regexes
            // defined by the user, use that value to validate.

            const userDefinedMediaType = getLastRegexThatMatches(resource);

            if (userDefinedMediaType) {
                if (userDefinedMediaType.toLowerCase() !== (contentTypeHeaderValue && contentTypeHeaderValue.toLowerCase())) {
                    await context.report(resource, element, `'Content-Type' header should have the value: '${userDefinedMediaType}'`);
                }

                return;
            }

            // Try to determine the media type and charset of the resource.

            const mediaType =
                determineMediaTypeBasedOnElement(element) ||
                determineMediaTypeBasedOnFileType(response.body.rawContent) ||
                determineMediaTypeBasedOnFileExtension(resource);

            const charset = ((mimeDB[mediaType] && mimeDB[mediaType].charset) || '').toLowerCase();

            let contentType;

            // Check if the `Content-Type` value is valid.

            try {
                if (contentTypeHeaderValue === '') {
                    throw new TypeError('invalid media type');
                }

                contentType = parse(contentTypeHeaderValue);
            } catch (e) {
                await context.report(resource, element, `'Content-Type' header value is invalid (${e.message})`);

                return;
            }

            // Check if the determined values differ
            // from the ones from the `Content-Type` header.

            // * media type

            if (mediaType && (mediaType !== contentType.type)) {
                await context.report(resource, element, `'Content-Type' header should have media type: '${mediaType}' (not '${contentType.type}')`);
            }

            // * charset value

            const originalCharset = contentType.parameters.charset;

            if (charset) {
                if (!originalCharset || (charset !== originalCharset.toLowerCase())) {
                    await context.report(resource, element, `'Content-Type' header should have 'charset=${charset}'${originalCharset ? ` (not '${originalCharset}')` : ''}`);
                }
            } else if (originalCharset && !['text/html', 'application/xhtml+xml'].includes(contentType.type)) {
                await context.report(resource, element, `'Content-Type' header should not have 'charset=${originalCharset}'`);
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
            category: 'interoperability',
            description: 'Check usage of `Content-Type` HTTP response header'
        },
        fixable: 'code',
        ignoredCollectors: ['cdp'], // TODO: Remove once #71 and #164 are fixed.
        recommended: true,
        schema: [{
            items: { type: 'string' },
            type: ['object', null],
            uniqueItems: true
        }],
        worksWithLocalFiles: false
    }
};

export default rule;
