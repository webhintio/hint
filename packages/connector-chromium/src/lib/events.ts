import * as puppeteer from 'puppeteer-core';
import { contentType, debug as d, HTMLDocument } from '@hint/utils';
import { FetchStart, FetchError, FetchEnd } from 'hint';
import { createFetchEndPayload, Fetcher } from './create-fetchend-payload';
import { getElementFromResponse } from './get-element-from-response';

const { getType } = contentType;
const debug: debug.IDebugger = d(__filename);

type RequestEvent = { name: 'fetch::start::target' | 'fetch::start'; payload: FetchStart };
type RequestFailedEvent = { name: 'fetch::error'; payload: FetchError } | null;
type ResponseEvent = { name: 'fetch::end::*' | 'fetch::end::html'; payload: FetchEnd } | null;

export const onRequestHandler = (request: puppeteer.Request): RequestEvent => {
    const requestUrl = request.url();
    const event = { resource: requestUrl };
    const name = request.isNavigationRequest() ?
        'fetch::start::target' :
        'fetch::start';

    debug(`Request started: ${requestUrl}`);

    return {
        name,
        payload: event
    };
};

export const onRequestFailedHandler = (request: puppeteer.Request, baseUrl: string, dom?: HTMLDocument): RequestFailedEvent => {
    const resource = request.url();

    if (!dom) {
        // DOM isn't loaded yet, no event to return
        return null;
    }

    debug(`Request failed: ${resource}`);

    const element = getElementFromResponse(request, baseUrl, dom);
    const hops: string[] = request.redirectChain()
        .map((redirect) => {
            return redirect.url();
        });

    const event: FetchError = {
        element,
        error: request.failure(),
        hops,
        resource
    };

    return {
        name: 'fetch::error',
        payload: event
    };
};

export const onResponseHandler = async (response: puppeteer.Response, baseUrl: string, fetchContent: Fetcher, dom?: HTMLDocument): Promise<ResponseEvent> => {
    const resource = response.url();
    const isTarget = response.request().isNavigationRequest();

    debug(`Response received: ${resource}`);

    if (!dom && !isTarget) {
        // DOM isn't loaded yet, no event to return
        return null;
    }

    const payload = await createFetchEndPayload(response, fetchContent, baseUrl, dom);
    /*
     * If the target has a weird value like `application/x-httpd-php`
     * (which translates into `unknown`) or is detected as `xml`.
     * (e.g.: because it starts with
     * `<?xml version="1.0" encoding="utf-8"?>` even though it has
     * `<!DOCTYPE html>` declared after),
     * we change the suffix to `html` so hints work properly.
     */
    let suffix = getType(payload.response.mediaType);
    const defaults = ['html', 'unknown', 'xml'];

    if (isTarget && defaults.includes(suffix)) {
        suffix = 'html';
    }

    const name = `fetch::end::${suffix}` as 'fetch::end::*';

    return {
        name,
        payload
    };
};
