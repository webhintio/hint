/**
 * @fileoverview This hint validates the `set-cookie` header and confirms that it is sent with `Secure` and `HttpOnly` directive over HTTPS.
 */

import { debug as d } from '@hint/utils/dist/src/debug';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { isHTTPS } from '@hint/utils/dist/src/network/is-https';
import { isRegularProtocol } from '@hint/utils/dist/src/network/is-regular-protocol';
import { FetchEnd, IHint } from 'hint/dist/src/lib/types';
import { HintContext, CodeLanguage } from 'hint/dist/src/lib/hint-context';

import { ParsedSetCookieHeader } from './types';
import meta from './meta';
import { getMessage } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ValidateSetCookieHeaderHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        /** If targetBrowsers contain ie 6, ie 7 or ie 8 */
        let supportOlderBrowsers: boolean;
        /**
         * A collection of accepted attributes
         * See https://stackoverflow.com/questions/19792038/what-does-priority-high-mean-in-the-set-cookie-header for details about the `priority` attribute.
         */
        const acceptedCookieAttributes: string[] = ['expires', 'max-age', 'domain', 'path', 'secure', 'httponly', 'samesite', 'priority'];
        /**
         * A collection of illegal characters in cookie name
         * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives
         */
        const illegalCookieNameChars: string = '()<>@,;:\"/[]?={}'; // eslint-disable-line no-useless-escape
        /**
         * A collection of illegal characters in cookie value
         * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives
         */
        const illegalCookieValueChars: string = ',;"/';
        /** Header name used in report */
        const headerName: string = 'set-cookie';

        type ValidationMessages = string[];
        type Validator = (parsedSetCookie: ParsedSetCookieHeader) => ValidationMessages;

        /** Trim double quote from the value string. */
        const unquote = (value: string): string => {
            return value.replace(/(^")|("$)/g, '');
        };

        /** Normalize the string before the first `=`, concat and unquote the strings after the first `=`. */
        const normalizeAfterSplitByEqual = (splitResult: string[]): string[] => {
            const [key, ...value]: string[] = splitResult;

            return [normalizeString(key)!, unquote(value.join('='))];
        };

        /**
         * `Set-Cookie` header parser based on the algorithm used by a user agent defined in the spec:
         * https://tools.ietf.org/html/rfc6265#section-5.2.1
         */
        const parse = (setCookieValue: string): ParsedSetCookieHeader => {
            const [nameValuePair, ...directivePairs]: string[] = setCookieValue.split(';');
            const [cookieName, cookieValue]: string[] = normalizeAfterSplitByEqual(nameValuePair.split('='));

            const setCookie: ParsedSetCookieHeader = {
                name: cookieName,
                value: cookieValue
            };

            if (directivePairs[directivePairs.length - 1] === '') {
                throw new Error(getMessage('noTrilingSemicolon', context.language, [headerName, setCookie.name]));
            }

            directivePairs.forEach((part) => {
                const [directiveKey, directiveValue] = normalizeAfterSplitByEqual(part.split('=')) as [keyof ParsedSetCookieHeader, string];

                if (!acceptedCookieAttributes.includes(directiveKey)) {
                    throw new Error(getMessage('unknownAttribute', context.language, [headerName, directiveKey]));
                }

                if (setCookie[directiveKey]) {
                    throw new Error(getMessage('duplicatedDirective', context.language, [headerName, directiveKey]));
                }

                (setCookie as any)[directiveKey] = directiveValue || true;

            });

            return setCookie;
        };

        const validASCII = (string: string): Boolean => {
            return (/^[\x00-\x7F]+$/).test(string); // eslint-disable-line no-control-regex
        };

        /**
         * Validate cookie name or value string.
         * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
         */
        const validString = (name: string, illegalChars: string): Boolean => {
            const includesIllegalChars: boolean = illegalChars.split('').some((char) => {
                return name.includes(char);
            });
            const includesWhiteSpace: boolean = (/\s/g).test(name);

            return validASCII(name) && !includesIllegalChars && !includesWhiteSpace;
        };

        /** Validate cookie name-value string. */
        const validateNameAndValue = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const cookieName: string = parsedSetCookie.name;
            const errors: ValidationMessages = [];

            const noNameValueStringError: string = getMessage('noNameValueString', context.language, headerName);
            const invalidNameError: string = getMessage('invalidName', context.language, [headerName, cookieName]);
            const invalidValueError: string = getMessage('invalidValue', context.language, [headerName, cookieName]);

            // Check name-value-string exists and it is before the first `;`.
            if (!cookieName || acceptedCookieAttributes.includes(cookieName)) {
                errors.push(noNameValueStringError);

                return errors;
            }

            // Validate cookie name.
            if (!validString(cookieName, illegalCookieNameChars)) {
                errors.push(invalidNameError);
            }

            // Validate cookie value.
            if (!validString(parsedSetCookie.value, illegalCookieValueChars)) {
                errors.push(invalidValueError);
            }

            return errors;
        };

        /** Validate cookie name prefixes. */
        const validatePrefixes = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const cookieName: string = parsedSetCookie.name;
            const resource: string = parsedSetCookie.resource || '';
            const errors: ValidationMessages = [];

            const hasPrefixHttpError: string = getMessage('hasPrefixHttp', context.language, headerName);
            const noPathHasHostPrefixError: string = getMessage('noPathHasHostPrefix', context.language, headerName);
            const hasDomainHostPrefixError: string = getMessage('hasDomainHostPrefix', context.language, headerName);

            if ((cookieName.startsWith('__secure-') || cookieName.startsWith('__host-')) && !isHTTPS(resource)) {
                errors.push(hasPrefixHttpError);
            }

            if (cookieName.startsWith('__host-')) {
                if (!parsedSetCookie.path || parsedSetCookie.path !== '/') {
                    errors.push(noPathHasHostPrefixError);
                }

                if (parsedSetCookie.domain) {
                    errors.push(hasDomainHostPrefixError);
                }
            }

            return errors;
        };

        /** Validate `Secure` and `HttpOnly` attributes. */
        const validateSecurityAttributes = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const cookieName: string = parsedSetCookie.name;
            const resource: string = parsedSetCookie.resource || '';
            const errors: ValidationMessages = [];

            const hasSecureHttpError: string = getMessage('hasSecureHttp', context.language, resource);
            const noSecureError: string = getMessage('noSecure', context.language, [headerName, cookieName]);
            const noHttpOnlyError: string = getMessage('noHttpOnly', context.language, [headerName, cookieName]);

            // Check against `Secure` directive if sites are insecure.
            if (!isHTTPS(resource) && parsedSetCookie.secure) {
                errors.push(hasSecureHttpError);

                return errors;
            }

            // Check for `Secure` directive if sites are secure.
            if (!parsedSetCookie.secure) {
                errors.push(noSecureError);
            }

            // Check for `httpOnly` directive.
            if (!parsedSetCookie.httponly) {
                errors.push(noHttpOnlyError);
            }

            return errors;
        };

        /** Validate `Expire` date format. */
        const validateExpireDate = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const cookieName: string = parsedSetCookie.name;
            const errors: ValidationMessages = [];

            if (!parsedSetCookie.expires) {
                return errors;
            }

            // Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
            const utcTimeString: string = new Date(parsedSetCookie.expires).toUTCString();
            const invalidDateError: string = getMessage('invalidDate', context.language, [headerName, cookieName]);
            const invalidDateFormatError: string = getMessage('invalidDateFormat', context.language, [headerName, cookieName, utcTimeString]);

            if (utcTimeString === 'Invalid Date') {
                errors.push(invalidDateError);

                return errors;
            }

            if (normalizeString(utcTimeString) !== normalizeString(parsedSetCookie.expires)) {
                errors.push(invalidDateFormatError);
            }

            return errors;
        };

        /** Validate the usage of `Max-Age` and `Expires` based on users' browser support matrix */
        const validateMaxAgeAndExpires = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const cookieName: string = parsedSetCookie.name;
            const errors: ValidationMessages = [];
            const maxAgeCompatibilityMessage: string = getMessage('maxAgeCompatibility', context.language, [headerName, cookieName]);
            const maxAgeAndExpireDuplicateMessage: string = getMessage('maxAgeAndExpireDuplicate', context.language);

            if (supportOlderBrowsers) {
                /*
                 * When targetBrowsers contains IE 6, IE 7 or IE 8:
                 * `max-age` can't be used alone.
                 */
                if (parsedSetCookie['max-age'] && !parsedSetCookie.expires) {
                    errors.push(maxAgeCompatibilityMessage);
                }

                return errors;
            }

            /*
             * When targetBrowsers only contains modern browsers:
             * `max-age` takes precedence so `expires` shouldn't be used.
             * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives
             */
            if (parsedSetCookie['max-age'] && parsedSetCookie.expires) {
                errors.push(maxAgeAndExpireDuplicateMessage);
            }

            return errors;
        };

        const loadHintConfigs = () => {
            supportOlderBrowsers = ['ie 6', 'ie 7', 'ie 8'].some((e) => {
                return context.targetedBrowsers.includes(e);
            });
        };

        const validate = ({ element, resource, response }: FetchEnd) => {
            const defaultValidators: Validator[] = [validateNameAndValue, validatePrefixes, validateSecurityAttributes, validateExpireDate, validateMaxAgeAndExpires];

            // This check does not apply if URI starts with protocols others than http/https.
            if (!isRegularProtocol(resource)) {
                debug(getMessage('checkDoesNotApply', context.language, resource));

                return;
            }

            const rawSetCookieHeaders: string | string[] = response.headers && response.headers['set-cookie'] || '';

            if (!rawSetCookieHeaders) {
                return;
            }

            /**  The `chrome` connector concatenates all `set-cookie` headers to one string. */
            const setCookieHeaders: string[] = Array.isArray(rawSetCookieHeaders) ? rawSetCookieHeaders : rawSetCookieHeaders.split(/\n|\r\n/);

            const reportBatch = (errorMessages: ValidationMessages, codeLanguage: CodeLanguage, codeSnippet: string) => {
                errorMessages.forEach((error) => {
                    context.report(resource, error, {
                        codeLanguage,
                        codeSnippet,
                        element
                    });
                });
            };

            for (const setCookieHeader of setCookieHeaders) {
                let parsedSetCookie: ParsedSetCookieHeader;
                const codeSnippet = `Set-Cookie: ${setCookieHeader}`;
                const codeLanguage = 'http';

                try {
                    parsedSetCookie = parse(setCookieHeader);
                    parsedSetCookie.resource = resource;
                } catch (err) {
                    context.report(resource, err.message, {
                        codeLanguage,
                        codeSnippet,
                        element
                    });

                    return;
                }

                defaultValidators.every((defaultValidator) => {
                    const messages: ValidationMessages = defaultValidator(parsedSetCookie);

                    if (messages.length) {
                        reportBatch(messages, codeLanguage, codeSnippet);

                        return false;
                    }

                    return true;
                });
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
