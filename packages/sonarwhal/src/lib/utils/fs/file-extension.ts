import { extname } from 'path';
import { URL } from 'url';

/*
 * Try to determine the resource's file extension.
 */
export default (resource: string): string => {
    let url: URL;

    try {
        /*
         * The url needs to be parsed first
         * otherwise the result from path.extname could be incorrect, e.g.: https://sonarwhal.com => '.com'
         */
        url = new URL(resource);
    } catch (err) {
        return extname(resource).split('.')
            .pop();
    }

    return extname(url.pathname).split('.')
        .pop();
};
