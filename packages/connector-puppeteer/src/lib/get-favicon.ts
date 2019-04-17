import { Fetcher } from './create-fetchend-payload';

import { debug as d, HTMLDocument } from '@hint/utils';
import { Engine } from 'hint';
const debug: debug.IDebugger = d(__filename);

/**
 * Manually download the site's favicon:
 *
 * * uses the `src` attribute of `<link rel="icon">` if present.
 * * uses `favicon.ico` and the final url after redirects.
 */
export const getFavicon = async (baseUrl: string, dom: HTMLDocument, fetchContent: Fetcher, engine: Engine) => {
    const element = (await dom.querySelectorAll('link[rel~="icon"]'))[0];
    const href = (element && element.getAttribute('href')) || '/favicon.ico';

    try {
        debug(`resource ${href} to be fetched`);
        const fullFaviconUrl = baseUrl + href.substr(1);

        await engine.emitAsync('fetch::start', { resource: fullFaviconUrl });

        const content = await fetchContent(new URL(fullFaviconUrl));

        const data = {
            element: null,
            request: content.request,
            resource: content.response.url,
            response: content.response
        };

        await engine.emitAsync('fetch::end::image', data);
    } catch (error) {
        const event = {
            element,
            error,
            hops: [],
            resource: href
        };

        await engine.emitAsync('fetch::error', event);
    }
};
