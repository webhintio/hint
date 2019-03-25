/**
 * @fileoverview Require scripts and styles to use Subresource Integrity
 */

import * as crypto from 'crypto';
import { URL } from 'url';

import { HintContext, ReportOptions } from 'hint/dist/src/lib/hint-context';
import { IHint, FetchEnd, ElementFound, NetworkData, Request, Response } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { requestAsync } from '@hint/utils/dist/src/network/request-async';

import { Algorithms, OriginCriteria, ErrorData, URLs } from './types';
import meta from './meta';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class SRIHint implements IHint {

    public static readonly meta = meta;

    private context: HintContext;
    private origin: string = '';
    private finalUrl: string = '';
    private baseline: keyof typeof Algorithms = 'sha384';
    private originCriteria: keyof typeof OriginCriteria = 'crossOrigin';
    private cache: Map<string, ErrorData[]> = new Map();
    /** Contains the keys cache keys for the element already reported. */
    private reportedKeys: Set<string> = new Set();

    /**
     * Returns the hash of the content for the given `sha` strengh in a format
     * valid with SRI:
     * * base64
     * * `sha384-hash`
     */
    private calculateHash(content: string, sha: string): string {
        const hash = crypto
            .createHash(sha)
            .update(content)
            .digest('base64');

        return hash;
    }

    /**
     * Checks if the element that originated the request/response is a
     * `script` or a `stylesheet`. There could be other downloads from
     * a `link` element that are not stylesheets and should be ignored.
     */

    private isScriptOrLink(evt: FetchEnd): Promise<boolean> {
        debug('Is <script> or <link>?');
        const { element } = evt;

        /*
         * We subscribe to `fetch::end::script|css`, so element should
         * always exist. "that should never happen" is the fastest way
         * to make it happen so better be safe.
         */

        /* istanbul ignore if */
        if (!element) {
            return Promise.resolve(false);
        }

        const nodeName = normalizeString(element.nodeName);

        /*
         * The element is not one that we care about (could be an img,
         * video, etc.). No need to report anything, but we can stop
         * processing things right away.
         */

        if (nodeName === 'script') {
            return Promise.resolve(!!element.getAttribute('src'));
        }

        if (nodeName === 'link') {
            const relValues = (normalizeString(element.getAttribute('rel'), ''))!.split(' '); // normalizeString won't return null as a default was passed.

            return Promise.resolve(relValues.includes('stylesheet'));
        }

        return Promise.resolve(false);
    }

    private report(resource: string, message: string, options: ReportOptions, evt: FetchEnd) {
        const errorData: ErrorData = {
            message,
            options,
            resource
        };

        const cacheKey = this.getCacheKey(evt);
        const cacheErrors = this.getCache(evt);

        cacheErrors.push(errorData);
        this.reportedKeys.add(cacheKey);

        this.context.report(errorData.resource, errorData.message, errorData.options);
    }

    /**
     * Verifies if the response is eligible for integrity validation. I.E.:
     *
     * * `same-origin`
     * * `cross-origin` on a CORS-enabled request
     *
     * More info in https://w3c.github.io/webappsec-subresource-integrity/#is-response-eligible
     */
    private isEligibleForIntegrityValidation(evt: FetchEnd, urls: URLs): Promise<boolean> {
        debug('Is eligible for integrity validation?');

        const { element, resource } = evt;
        const resourceOrigin: string = new URL(resource).origin;

        if (urls.origin === resourceOrigin) {
            return Promise.resolve(true);
        }

        // cross-origin scripts need to be loaded with a valid "crossorigin" attribute (ie.: anonymous or use-credentials)
        const crossorigin = normalizeString(element && element.getAttribute('crossorigin'));

        if (!crossorigin) {
            const message = `Cross-origin resource ${resource} needs a "crossorigin" attribute to be eligible for integrity validation`;

            this.report(urls.final, message, { element }, evt);

            return Promise.resolve(false);
        }

        const validCrossorigin = crossorigin === 'anonymous' || crossorigin === 'use-credentials';

        if (!validCrossorigin) {
            const message = `Attribute "crossorigin" for resource ${resource} doesn't have a valid value, should "anonymous" or "use-credentials": crossorigin="${crossorigin}"`;

            this.report(urls.final, message, { element }, evt);
        }

        return Promise.resolve(validCrossorigin);
    }

    /**
     * Checks if the element that triggered the download has the `integrity`
     * attribute if required based on the selected origin criteria.
     */
    private hasIntegrityAttribute(evt: FetchEnd, urls: URLs): Promise<boolean> {
        debug('has integrity attribute?');
        const { element, resource } = evt;
        const integrity = element && element.getAttribute('integrity');
        const resourceOrigin: string = new URL(resource).origin;
        const integrityRequired =
            OriginCriteria[this.originCriteria] === OriginCriteria.all ||
            urls.origin !== resourceOrigin;

        if (integrityRequired && !integrity) {
            const message = `Resource ${resource} requested without the "integrity" attribute`;

            this.report(urls.final, message, { element }, evt);
        }

        return Promise.resolve(!!integrity);
    }

    /**
     * Checks if the format of the `integrity` attribute is valid and if the used hash meets
     * the baseline (by default sha-384). In the case of multiple algorithms used, the
     * one with the highest priority is the used one to validate. E.g.:
     *
     * * `<script src="https://example.com/example-framework.js"
     *   integrity="sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEbzJr7"
     *   crossorigin="anonymous"></script>`
     * * `<script src="https://example.com/example-framework.js"
     *   integrity="sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEbzJr7
     *              sha384-+/M6kredJcxdsqkczBUjMLvqyHb1K/JThDXWsBVxMEeZHEaMKEOEct339VItX1zB"
     *   crossorigin="anonymous"></script>`
     *
     * https://w3c.github.io/webappsec-subresource-integrity/#agility
     */
    private isIntegrityFormatValid(evt: FetchEnd, urls: URLs): Promise<boolean> {
        debug('Is integrity attribute valid?');
        const { element, resource } = evt;
        const integrity = element && element.getAttribute('integrity');
        const integrityRegExp = /^sha(256|384|512)-/;
        const integrityValues = integrity ? integrity.split(/\s+/) : [];
        let highestAlgorithmPriority = 0;
        const that = this;

        const areFormatsValid = integrityValues.every((integrityValue: string) => {
            const results = integrityRegExp.exec(integrityValue);
            const isValid = Array.isArray(results);

            if (!isValid) {
                // integrity must exist since we're iterating over integrityValues
                const message = `The format of the "integrity" attribute for resource ${resource} should be "sha(256|384|512)-HASH": ${integrity!.substr(0, 10)}…`;

                that.report(urls.final, message, { element }, evt);

                return false;
            }

            // results won't be null since isValid must be true to get here.
            const algorithm = `sha${results![1]}` as keyof typeof Algorithms;
            const algorithmPriority = Algorithms[algorithm];

            highestAlgorithmPriority = Math.max(algorithmPriority, highestAlgorithmPriority);

            return true;
        });

        if (!areFormatsValid) {
            return Promise.resolve(false);
        }

        const baseline = Algorithms[this.baseline];
        const meetsBaseline = highestAlgorithmPriority >= baseline;

        if (!meetsBaseline) {
            const message = `The hash algorithm "${Algorithms[highestAlgorithmPriority]}" doesn't meet the baseline "${this.baseline}" in resource ${resource}`;

            this.report(urls.final, message, { element }, evt);
        }

        return Promise.resolve(meetsBaseline);
    }

    /**
     * Checks if the resources is being delivered via HTTPS.
     *
     * More info: https://w3c.github.io/webappsec-subresource-integrity/#non-secure-contexts
     */
    private isSecureContext(evt: FetchEnd, urls: URLs): Promise<boolean> {
        debug('Is delivered on a secure context?');
        const { element, resource } = evt;
        const protocol = new URL(resource).protocol;
        const isSecure = protocol === 'https:';

        if (!isSecure) {
            const message = `The resource ${resource} is not delivered via a secure context`;

            this.report(urls.final, message, { element }, evt);
        }

        return Promise.resolve(isSecure);
    }

    /**
     * Calculates if the hash is the right one for the downloaded resource.
     *
     * An `integrity` attribute can have multiple hashes for the same algorithm and it will
     * pass as long as one validates.
     *
     * More info: https://w3c.github.io/webappsec-subresource-integrity/#does-response-match-metadatalist
     */
    private hasRightHash(evt: FetchEnd, urls: URLs): Promise<boolean> {
        debug('Does it have the right hash?');
        const { element, resource, response } = evt;
        const integrity = element && element.getAttribute('integrity');
        const integrities = integrity ? integrity.split(/\s+/) : [];
        const calculatedHashes: Map<string, string> = new Map();

        const isOK = integrities.some((integrityValue) => {
            const integrityRegExp = /^sha(256|384|512)-(.*)$/;
            const [, bits = '', hash = ''] = integrityRegExp.exec(integrityValue) || [];
            const calculatedHash = calculatedHashes.has(bits) ?
                calculatedHashes.get(bits)! :
                this.calculateHash(response.body.content, `sha${bits}`);

            calculatedHashes.set(bits, calculatedHash);

            return hash === calculatedHash;
        });

        if (!isOK) {
            const hashes: string[] = [];

            calculatedHashes.forEach((value, key) => {
                hashes.push(`sha${key}-${value}`);
            });

            const message = `The hash in the "integrity" attribute in resource ${resource} doesn't match the received payload.
Expected: ${hashes.join(', ')}
Actual:   ${integrities.join(', ')}`;

            this.report(urls.final, message, { element }, evt);
        }

        return Promise.resolve(isOK);
    }

    private getCache(evt: FetchEnd): ErrorData[] {
        const key = this.getCacheKey(evt);

        if (!this.cache.has(key)) {
            this.cache.set(key, []);
        }

        return this.cache.get(key)!;
    }

    private getCacheKey(evt: FetchEnd): string {
        const { element, resource } = evt;

        /* istanbul ignore if */
        if (!element) {
            return '';
        }

        const integrity = element.getAttribute('integrity');

        return `${resource}${integrity}`;
    }

    private addToCache(evt: FetchEnd) {
        const { element, resource } = evt;

        /* istanbul ignore if */
        if (!element) {
            return Promise.resolve(false);
        }

        const integrity = element.getAttribute('integrity');

        const key = `${resource}${integrity}`;

        if (!this.cache.has(key)) {
            this.cache.set(key, []);
        }

        return Promise.resolve(true);
    }

    /**
     * If the resource is a local file, ignore the analysis.
     * The sri usually is added on the building process before publish,
     * so is going to be very common that the sri doesn't exists
     * for local files.
     */
    private isNotLocalResource(evt: FetchEnd) {
        const { resource } = evt;

        if (resource.startsWith('file://')) {
            debug(`Ignoring local resource: ${resource}`);

            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    /**
     * The item is cached. For the VSCode extension and the
     * local connector with option 'watch' activated we
     * should report what we have in the cache after the
     * first 'scan::end'.
     */
    private isInCache(evt: FetchEnd): Promise<boolean> {
        const cacheKey = this.getCacheKey(evt);
        const isInCache = this.cache.has(cacheKey);

        if (isInCache && !this.reportedKeys.has(cacheKey)) {
            this.getCache(evt).forEach((error) => {
                this.context.report(error.resource, error.message, error.options);
            });

            this.reportedKeys.add(cacheKey);

            return Promise.resolve(false);
        }

        return Promise.resolve(!isInCache);
    }

    /**
     * `requestAsync` is not included in webpack bundle for `extension-browser`.
     * This is ok because the browser will have already requested this via `fetch::end`
     * events.
     *
     * Note: We are not using `Requester` because it depends on `iltorb` and it can
     * cause problems with the vscode-extension because `iltorb` depends on the
     * node version for which it was compiled.
     *
     * We can probably use Requester once https://github.com/webhintio/hint/issues/1604 is done,
     * and vscode use the node version that support it.
     *
     * When using crossorigin="use-credentials" and the response contains
     * the header `Access-Control-Allow-Origin` with value `*` Chrome blocks the access
     * to the resource by CORS policy, so we will reach this point
     * through the traverse of the dom and response.body.content will be ''. In this case,
     * we have to prevent the download of the resource.
     */
    private async downloadContent(evt: FetchEnd, urls: URLs): Promise<boolean> {
        const { resource, response, element } = evt;

        if (!requestAsync && !response.body.content) {
            // Stop the validations.
            return false;
        }

        if (!requestAsync) {
            return true;
        }

        /* If the content already exists, we don't need to download it. */
        if (response.body.content) {
            return true;
        }

        try {
            response.body.content = await requestAsync({
                gzip: true,
                method: 'GET',
                url: resource
            });

            return true;
        } catch (e) {
            debug(`Error accessing ${resource}. ${JSON.stringify(e)}`);

            this.context.report(urls.final, `Can't get the resource ${resource}`, { element });

            return false;
        }
    }

    private isNotIgnored(evt: FetchEnd) {
        return !this.context.isUrlIgnored(evt.resource);
    }

    /** Validation entry point. */
    private async validateResource(evt: FetchEnd, urls: URLs) {
        const validations = [
            this.isNotIgnored,
            this.isInCache,
            this.addToCache,
            this.isScriptOrLink,
            this.isNotLocalResource,
            this.isEligibleForIntegrityValidation,
            this.hasIntegrityAttribute,
            this.isIntegrityFormatValid,
            this.isSecureContext,
            this.downloadContent,
            this.hasRightHash
        ].map((fn) => {
            return fn.bind(this);
        });

        debug(`Validating integrity of: ${evt.resource}`);

        for (const validation of validations) {
            const valid = await validation(evt, urls);

            if (!valid) {
                break;
            }
        }
    }

    /**
     * Validation entry point for event element::script
     * or element::link
     */
    private async validateElement(evt: ElementFound) {
        const isScriptOrLink = await this.isScriptOrLink(evt as FetchEnd);

        if (!isScriptOrLink) {
            return;
        }

        const finalUrl = evt.resource;
        const origin = new URL(evt.resource).origin;

        /*
         * 'this.isScriptOrLink' has already checked
         * that the src or href attribute exists, so it is safe to use !.
         */
        evt.resource = new URL(evt.element.getAttribute('src')! || evt.element.getAttribute('href')!, evt.resource).href;

        const content: NetworkData = {
            request: {} as Request,
            response: { body: { content: '' } } as Response
        };

        await this.validateResource(Object.assign(evt, {
            request: content.request,
            response: content.response
        }), {
            final: finalUrl,
            origin
        });
    }

    /** Sets the `origin` property using the initial request. */
    private setOrigin(evt: FetchEnd): void {
        const { resource } = evt;

        this.origin = new URL(resource).origin; // Our @types/node doesn't have it
        this.finalUrl = resource;
    }

    private onScanEnd(): void {
        this.reportedKeys.clear();
    }

    public constructor(context: HintContext) {
        this.context = context;

        if (context.hintOptions) {
            this.baseline = context.hintOptions.baseline || this.baseline;
            this.originCriteria = context.hintOptions.originCriteria || this.originCriteria;
        }

        context.on('fetch::end::script', (evt: FetchEnd) => {
            this.validateResource(evt, {
                final: this.finalUrl,
                origin: this.origin
            });
        });
        context.on('fetch::end::css', (evt: FetchEnd) => {
            this.validateResource(evt, {
                final: this.finalUrl,
                origin: this.origin
            });
        });
        context.on('element::script', this.validateElement.bind(this));
        context.on('element::link', this.validateElement.bind(this));
        context.on('fetch::end::html', this.setOrigin.bind(this));
        context.on('scan::end', this.onScanEnd.bind(this));
    }
}
