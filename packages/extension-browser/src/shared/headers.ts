import { HttpHeaders } from '@hint/utils-types/dist/src/http-headers';

/** Convert `webRequest` or `devtools.network` headers to `hint` headers. */
export const mapHeaders = (webRequestHeaders: { name: string; value?: string }[]): HttpHeaders => {
    /* istanbul ignore if */
    if (!webRequestHeaders) {
        return {};
    }

    return webRequestHeaders.reduce((headers, header) => {
        headers[header.name.toLowerCase()] = header.value || '';

        return headers;
    }, {} as HttpHeaders);
};
