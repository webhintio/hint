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

/** Checks if the given `contentType` is for text based on the `Requester.decodeableContentTypes` list  */
const requiresDecoding = (contentType: string): boolean => {
    let requires = false;

    for (let i = 0; i < decodeableContentTypes.length && !requires; i++) {
        const ct = decodeableContentTypes[i];

        requires = ct.test(contentType);
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
export const getCharset = (headers) => {
    const contentType: string = headers['content-type'];

    if (!requiresDecoding(contentType)) {
        debug(`Content Type ${contentType} doesn't require decoding`);

        return null;
    }

    if (!contentType.includes('charset')) {
        debug('No charset defined, falling back to utf-8');

        return 'utf-8';
    }

    const charsetRegex = /.*charset=(\S+)/gi;
    const results = charsetRegex.exec(contentType);

    debug(`Charset for ${contentType} is ${results[1]}`);

    return charsetAliases.get(results[1]) || results[1];
};