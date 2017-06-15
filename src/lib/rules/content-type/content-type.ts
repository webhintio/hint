/**
 * @fileoverview Check the usage of the `Content-Type` HTTP response
 * header.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';
import * as url from 'url';

import { debug as d } from '../../utils/debug';
import * as fileType from 'file-type';
import * as isSvg from 'is-svg';
import * as mimeDB from 'mime-db';
import { parse } from 'content-type';

import { IAsyncHTMLElement, IResponseBody, IRule, IRuleBuilder, IFetchEnd } from '../../types'; // eslint-disable-line no-unused-vars
import { isDataURI, normalizeString } from '../../utils/misc';
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

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

        const determineCharset = (determinedMediaType: string, originalMediaType: string) => {
            const typeInfo = mimeDB[determinedMediaType];

            if (typeInfo && typeInfo.charset) {
                return normalizeString(typeInfo.charset);
            }

            const textMediaTypes: Array<RegExp> = [
                /application\/(?:javascript|json|x-javascript|xml)/i,
                /application\/.*\+(?:json|xml)/i,
                /image\/svg\+xml/i,
                /text\/.*/i
            ];

            if (textMediaTypes.some((regex) => {
                return regex.test(originalMediaType);
            })) {
                return 'utf-8';
            }

            return null;
        };

        const determineMediaTypeForScript = (element: IAsyncHTMLElement) => {
            const typeAttribute = normalizeString(element.getAttribute('type'));

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
                // https://tools.ietf.org/html/rfc4329#page-10
                return 'application/javascript';
            }

            return null;
        };

        const determineMediaTypeBasedOnElement = (element: IAsyncHTMLElement) => {
            const nodeName = element && normalizeString(element.nodeName);

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
                            // https://w3c.github.io/manifest/#media-type-registration
                            return 'application/manifest+json';
                    }
                    /* eslint-enable no-default */
                }
            }

            return null;
        };

        const determineMediaTypeBasedOnFileExtension = (resource: string) => {
            const fileExtension = path.extname(url.parse(resource).pathname).split('.')
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
                // https://www.w3.org/TR/SVG/mimereg.html
                return 'image/svg+xml';
            }

            return null;
        };

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, resource, response } = fetchEnd;

            // This check does not make sense for data URIs.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URIs`);

                return;
            }

            const contentTypeHeaderValue = normalizeString(response.headers['content-type']);

            // Check if the `Content-Type` header was sent.

            if (contentTypeHeaderValue === null) {
                await context.report(resource, element, `'content-type' header was not specified`);

                return;
            }

            // If the current resource matches any of the regexes
            // defined by the user, use that value to validate.

            const userDefinedMediaType = getLastRegexThatMatches(resource);

            if (userDefinedMediaType) {
                if (normalizeString(userDefinedMediaType) !== contentTypeHeaderValue) {
                    await context.report(resource, element, `'content-type' header should have the value '${userDefinedMediaType}'`);
                }

                return;
            }

            let contentType;

            // Check if the `Content-Type` value is valid.

            try {
                if (contentTypeHeaderValue === '') {
                    throw new TypeError('invalid media type');
                }

                contentType = parse(contentTypeHeaderValue);
            } catch (e) {
                await context.report(resource, element, `'content-type' header value is invalid (${e.message})`);

                return;
            }

            const originalCharset = normalizeString(contentType.parameters.charset);
            const originalMediaType = contentType.type;

            // Try to determine the media type and charset of the resource.

            const mediaType =
                determineMediaTypeBasedOnElement(element) ||
                determineMediaTypeBasedOnFileType(response.body.rawContent) ||
                determineMediaTypeBasedOnFileExtension(resource);

            const charset = determineCharset(mediaType, originalMediaType);

            // Check if the determined values differ
            // from the ones from the `Content-Type` header.

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

        return {
            'fetch::end': validate,
            'manifestfetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: 'interoperability',
            description: 'Require `Content-Type` header with appropriate value'
        },
        fixable: 'code',
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
