/**
 * @fileoverview This hint validates the `set-cookie` header and confirms that it is sent with `Secure` and `HttpOnly` directive over HTTPS.
 */

import { debug as d } from '@hint/utils-debug';
import { normalizeString } from '@hint/utils-string';
import { isHTTPS, isRegularProtocol } from '@hint/utils-network';
import { FetchEnd, IHint } from 'hint/dist/src/lib/types';
import { HintContext, CodeLanguage } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';

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
        const acceptedCookieAttributes = ['expires', 'max-age', 'domain', 'path', 'secure', 'httponly', 'samesite', 'priority'];
        /**
         * A collection of illegal characters in cookie name
         * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives
         */
        const illegalCookieNameChars = '()<>@,;:\\"/[]?={}';
        /**
         * A collection of illegal characters in cookie value
         * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives
         */
        const illegalCookieValueChars = ',;"\\';

        type ValidationMessages = { message: string; severity: Severity }[];
        type Validator = (parsedSetCookie: ParsedSetCookieHeader) => ValidationMessages;

        /** Trim double quote from the value string. */
        const unquote = (value: string): string => {
            return value.replace(/(^")|("$)/g, '');
        };

        /** Normalize the string before the first `=`, concat and unquote the strings after the first `=`. */
        const normalizeAfterSplitByEqual = (splitResult: string[]): string[] => {
            const [key, ...value] = splitResult;

            return [normalizeString(key)!, unquote(value.join('='))];
        };

        /**
         * `Set-Cookie` header parser based on the algorithm used by a user agent defined in the spec:
         * https://tools.ietf.org/html/rfc6265#section-5.2.1
         */
        const parse = (setCookieValue: string) => {
            const [nameValuePair, ...directivePairs] = setCookieValue.split(';');
            const [cookieName, cookieValue] = normalizeAfterSplitByEqual(nameValuePair.split('='));

            const setCookie: ParsedSetCookieHeader = {
                name: cookieName,
                value: cookieValue
            };

            const errors = [];

            if (directivePairs[directivePairs.length - 1] === '') {
                errors.push({
                    message: getMessage('noTrilingSemicolon', context.language),
                    severity: Severity.hint
                });

                directivePairs.pop(); // remove the empty one to continue the parsing
            }

            directivePairs.forEach((part) => {
                const [directiveKey, directiveValue] = normalizeAfterSplitByEqual(part.split('=')) as [keyof ParsedSetCookieHeader, string];

                let ok = true;

                if (!acceptedCookieAttributes.includes(directiveKey)) {
                    errors.push({
                        message: getMessage('unknownAttribute', context.language, directiveKey),
                        severity: Severity.warning
                    });

                    ok = false;
                }

                if (setCookie[directiveKey]) {
                    errors.push({
                        message: getMessage('duplicatedDirective', context.language),
                        severity: Severity.warning
                    });

                    ok = false;
                }

                if (ok) {
                    (setCookie as any)[directiveKey] = directiveValue || true;
                }
            });

            return { errors, setCookie };
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
            const cookieName = parsedSetCookie.name;
            const errors: ValidationMessages = [];

            const noNameValueStringError = getMessage('noNameValueString', context.language);
            const invalidNameError = getMessage('invalidName', context.language);
            const invalidValueError = getMessage('invalidValue', context.language);
            const severity = Severity.error;

            // Check name-value-string exists and it is before the first `;`.
            if (!cookieName || acceptedCookieAttributes.includes(cookieName)) {
                errors.push({ message: noNameValueStringError, severity });

                return errors;
            }

            // Validate cookie name.
            if (!validString(cookieName, illegalCookieNameChars)) {
                errors.push({ message: invalidNameError, severity });
            }

            // Validate cookie value.
            if (!validString(parsedSetCookie.value, illegalCookieValueChars)) {
                errors.push({ message: invalidValueError, severity });
            }

            return errors;
        };

        /** Validate cookie name prefixes. */
        const validatePrefixes = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const cookieName = parsedSetCookie.name;
            const resource = parsedSetCookie.resource || '';
            const errors: ValidationMessages = [];

            const hasPrefixHttpError = getMessage('hasPrefixHttp', context.language);
            const noPathHasHostPrefixError = getMessage('noPathHasHostPrefix', context.language);
            const hasDomainHostPrefixError = getMessage('hasDomainHostPrefix', context.language);

            if ((cookieName.startsWith('__secure-') || cookieName.startsWith('__host-')) && !isHTTPS(resource)) {
                errors.push({ message: hasPrefixHttpError, severity: Severity.error });
            }

            if (cookieName.startsWith('__host-')) {
                if (!parsedSetCookie.path || parsedSetCookie.path !== '/') {
                    errors.push({ message: noPathHasHostPrefixError, severity: Severity.error });
                }

                if (parsedSetCookie.domain) {
                    errors.push({ message: hasDomainHostPrefixError, severity: Severity.error });
                }
            }

            return errors;
        };

        /** Validate `Secure` and `HttpOnly` attributes. */
        const validateSecurityAttributes = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const resource = parsedSetCookie.resource || '';
            const errors: ValidationMessages = [];

            const hasSecureHttpError = getMessage('hasSecureHttp', context.language);
            const noSecureError = getMessage('noSecure', context.language);
            const noHttpOnlyError = getMessage('noHttpOnly', context.language);

            // Check against `Secure` directive if sites are insecure.
            if (!isHTTPS(resource) && parsedSetCookie.secure) {
                errors.push({ message: hasSecureHttpError, severity: Severity.error });

                return errors;
            }

            // Check for `Secure` directive if sites are secure.
            if (!parsedSetCookie.secure) {
                errors.push({ message: noSecureError, severity: Severity.error });
            }

            // Check for `httpOnly` directive.
            if (!parsedSetCookie.httponly) {
                errors.push({ message: noHttpOnlyError, severity: Severity.warning });
            }

            return errors;
        };

        /** Validate `Expire` date format. */
        const validateExpireDate = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const errors: ValidationMessages = [];

            if (!parsedSetCookie.expires) {
                return errors;
            }

            // Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
            const utcTimeString = new Date(parsedSetCookie.expires).toUTCString();
            const invalidDateError = getMessage('invalidDate', context.language);
            const invalidDateFormatError = getMessage('invalidDateFormat', context.language, utcTimeString);

            if (utcTimeString === 'Invalid Date') {
                errors.push({ message: invalidDateError, severity: Severity.error });

                return errors;
            }

            if (normalizeString(utcTimeString) !== normalizeString(parsedSetCookie.expires)) {
                errors.push({ message: invalidDateFormatError, severity: Severity.warning });
            }

            return errors;
        };

        /** Validate the usage of `Max-Age` and `Expires` based on users' browser support matrix */
        const validateMaxAgeAndExpires = (parsedSetCookie: ParsedSetCookieHeader): ValidationMessages => {
            const errors: ValidationMessages = [];
            const maxAgeCompatibilityMessage = getMessage('maxAgeCompatibility', context.language);
            const maxAgeAndExpireDuplicateMessage = getMessage('maxAgeAndExpireDuplicate', context.language);

            if (supportOlderBrowsers) {
                /*
                 * When targetBrowsers contains IE 6, IE 7 or IE 8:
                 * `max-age` can't be used alone.
                 */
                if (parsedSetCookie['max-age'] && !parsedSetCookie.expires) {
                    errors.push({ message: maxAgeCompatibilityMessage, severity: Severity.error });
                }

                return errors;
            }

            /*
             * When targetBrowsers only contains modern browsers:
             * `max-age` takes precedence so `expires` shouldn't be used.
             * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Directives
             */
            if (parsedSetCookie['max-age'] && parsedSetCookie.expires) {
                errors.push({ message: maxAgeAndExpireDuplicateMessage, severity: Severity.hint });
            }

            return errors;
        };

        const loadHintConfigs = () => {
            supportOlderBrowsers = ['ie 6', 'ie 7', 'ie 8'].some((e) => {
                return context.targetedBrowsers.includes(e);
            });
        };

        const validate = ({ element, resource, response }: FetchEnd) => {
            const defaultValidators: Validator[] = [
                validateNameAndValue,
                validatePrefixes,
                validateSecurityAttributes,
                validateExpireDate,
                validateMaxAgeAndExpires
            ];

            // This check does not apply if URI starts with protocols others than http/https.
            if (!isRegularProtocol(resource)) {
                debug(`Check does not apply for URI: ${resource}`);

                return;
            }

            const rawSetCookieHeaders: string | string[] = response.headers && response.headers['set-cookie'] || '';

            if (!rawSetCookieHeaders) {
                return;
            }

            /**  The `chrome` connector concatenates all `set-cookie` headers to one string. */
            const setCookieHeaders: string[] = Array.isArray(rawSetCookieHeaders) ? rawSetCookieHeaders : rawSetCookieHeaders.split(/\n|\r\n/);

            const reportBatch = (errorMessages: ValidationMessages, codeLanguage: CodeLanguage, codeSnippet: string) => {
                errorMessages.forEach(({ message, severity }) => {
                    context.report(resource, message, {
                        codeLanguage,
                        codeSnippet,
                        element,
                        severity
                    });
                });
            };

            for (const setCookieHeader of setCookieHeaders) {
                const codeSnippet = `Set-Cookie: ${setCookieHeader}`;
                const codeLanguage = 'http';

                const { errors, setCookie: parsedSetCookie } = parse(setCookieHeader);

                if (errors) {
                    for (const { message, severity } of errors) {
                        context.report(resource, message, {
                            codeLanguage,
                            codeSnippet,
                            element,
                            severity
                        });
                    }
                }

                parsedSetCookie.resource = resource;

                const messages = defaultValidators.reduce<ValidationMessages>((messages, defaultValidator) => {
                    return messages.concat(defaultValidator(parsedSetCookie));
                }, []);

                reportBatch(messages, codeLanguage, codeSnippet);
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
