import { extname } from 'path';
import { URL } from 'url';

/*
 * Try to determine the resource's file extension.
 */
export const fileExtension = (resource: string): string => {
    let url: URL;

    try {
        /*
         * The url needs to be parsed first
         * otherwise the result from path.extname could be incorrect, e.g.: https://webhint.io => '.com'
         *
         * Adding 'http://example.com' as a base will avoid throwing an error
         * in case the resource is a relative URL.
         */
        url = new URL(resource, 'http://example.com');
    } catch (err) {
        return extname(resource).split('.')
            .pop() || '';
    }

    return extname(url.pathname).split('.')
        .pop() || '';
};
