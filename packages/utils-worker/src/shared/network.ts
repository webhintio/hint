import { FetchEnd } from 'hint/dist/src/lib/types';
import { getContentTypeData, getType } from '@hint/utils/dist/src/content-type';
import { getElementByUrl, HTMLDocument } from '@hint/utils-dom';
import { HttpHeaders } from '@hint/utils-types';

const lowerCaseHeaderNames = (headers: HttpHeaders) => {
    for (const header of Object.keys(headers)) {
        const name = header.toLowerCase();
        const value = headers[header];

        if (name !== header) {
            delete headers[header];
            headers[name] = value;
        }
    }
};

const setFetchElement = (event: FetchEnd, document?: HTMLDocument) => {
    const url = event.request.url;

    if (document) {
        event.element = getElementByUrl(document, url);
    }
};

const setFetchType = (event: FetchEnd): string => {
    const { charset, mediaType } = getContentTypeData(null, event.response.url, event.response.headers, null as any);

    event.response.charset = charset || '';
    event.response.mediaType = mediaType || '';

    return getType(mediaType || '');
};

export const finalizeFetchEnd = (event: FetchEnd, document?: HTMLDocument) => {
    lowerCaseHeaderNames(event.request.headers);
    lowerCaseHeaderNames(event.response.headers);
    setFetchElement(event, document);

    const type = setFetchType(event);

    return { type };
};
