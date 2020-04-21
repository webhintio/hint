import { getContentTypeData, getType } from '@hint/utils/dist/src/content-type';
import { FetchEnd } from 'hint/dist/src/lib/types';

export const setFetchType = async (event: FetchEnd) => {
    const { charset, mediaType } = await getContentTypeData(null, event.response.url, event.response.headers, null as any);

    event.response.charset = charset || '';
    event.response.mediaType = mediaType || '';

    return getType(mediaType || '');
};
