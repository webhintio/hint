import { parse, MediaType } from 'content-type'; //eslint-disable-line no-unused-vars

import { debug as d } from '../../utils/debug';

const debug = d(__filename);

/** Charset aliases when receiving `charset` in a `content-type`. */
const charsetAliases: Map<string, string> = new Map([
    ['iso-8859-1', 'latin1']
]);

/** The content types we can decode. */
const decodeableContentTypes: Array<RegExp> = [
    /application\/(?:javascript|json|x-javascript|xml)/i,
    /application\/.*\+(?:json|xml)/i, // application/xhtml+xml
    /image\/svg\+xml/i,
    /text\/.*/i
];

/** Checks if the given `mediaType` is for text based on the `Requester.decodeableContentTypes` list  */
const requiresDecoding = (mediaType: string): boolean => {
    let requires = false;

    for (let i = 0; i < decodeableContentTypes.length && !requires; i++) {
        const ct = decodeableContentTypes[i];

        requires = ct.test(mediaType);
    }

    return requires;
};

/** Returns the charset specified in the `content-type` header if specified. Defaults to `utf-8` if
 * `Content-Type` is of text type but `charset` is not specified.  it is a text, and `null` otherwise.
 *
 * Ex.:
 * * 'Content-Type': 'text/html; charset=iso-8859-1' --> 'iso-8859-1'
 * * 'Content-Type': 'text/html; charset=random-charset' --> 'random-charset'
 * * 'Content-Type': 'text/html' --> 'utf-8'
 * * 'Content-Type': 'image/jpeg' --> null
 */
export const getCharset = (headers: object): string => {
    const headerValue: string = headers['content-type'];
    let contentType: MediaType;

    try {
        contentType = parse(headerValue);
    } catch (e) {
        debug(`Invalid value ('${headerValue}') for the 'Content-Type' header: ${e.message}`);

        return null;
    }

    const charset = contentType.parameters.charset || '';
    const mediaType = contentType.type;

    if (!requiresDecoding(mediaType)) {
        debug(`Content Type '${headerValue}' doesn't require decoding`);

        return null;
    }

    if (!charset) {
        debug(`No 'charset' defined, falling back to 'utf-8'`);

        return 'utf-8';
    }

    debug(`Charset for '${headerValue}' is '${charset}'`);

    return charsetAliases.get(charset) || charset;
};
