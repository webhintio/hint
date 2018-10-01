import { parse as parseContentTypeHeader } from 'content-type';
import { HttpHeaders } from '../../types';
import isLocalFile from './is-local-file';

/** Convenience function to check if a resource is a HTMLDocument. */
export default (targetURL: string, responseHeaders: HttpHeaders): boolean => {

    // If it's a local file, presume it's a HTML document.

    if (isLocalFile(targetURL)) {
        return true;
    }

    // Otherwise, check.

    const contentTypeHeaderValue: string | undefined = responseHeaders['content-type'];
    let mediaType: string;

    try {
        mediaType = parseContentTypeHeader(contentTypeHeaderValue || '').type;
    } catch (e) {
        return false;
    }

    return mediaType === 'text/html';
};
