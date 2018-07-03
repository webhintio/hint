/**
 * @fileoverview Require scripts and styles to use Subresource Integrity
 */

import * as crypto from 'crypto';
import { URL } from 'url';
import { promisify } from 'util';

import * as async from 'async';

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, FetchEnd } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug: debug.IDebugger = d(__filename);
const everySeries = promisify(async.everySeries);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

// We don't do a `const enum` because of this: https://stackoverflow.com/questions/18111657/how-does-one-get-the-names-of-typescript-enum-entries#comment52596297_18112157
enum algorithms {
    sha256 = 1,
    sha384 = 2,
    sha512 = 3
}

export default class SRIHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.security,
            description: `Require scripts and link elements to use Subresource Integrity`
        },
        id: 'sri',
        schema: [{
            additionalProperties: false,
            properties: {
                baseline: {
                    oneOf: [Object.keys(algorithms)],
                    type: 'string'
                }
            }
        }],
        scope: HintScope.any
    }

    private resources: Map<string, string>;
    private context: HintContext;
    private origin: string;
    private baseline: string = 'sha384';

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
     * Checks if the element that originated the request/response is a script or a stylesheet.
     * There could be other downloads from a `link` element that are not stylesheets and should
     * be ignored.
     */
    private isScriptOrLink(evt: FetchEnd): Promise<boolean> {
        debug('Is <script> or <link>?');
        const { element } = evt;

        /*
         * We subscribe to `fetch::end::script|css`, so element should always exist.
         * "that should never happen" is the fastest way to make it happen so better be safe
         */
        /* istanbul ignore if */
        if (!element) {
            return Promise.resolve(false);
        }

        /*
         * The element is not one that we care about (could be an img, video, etc.)
         * No need to report anything, but we can stop processing things right away.
         */
        const isScript: boolean = element.nodeName === 'SCRIPT' && !!element.getAttribute('src');
        const isStyle: boolean = element.nodeName === 'LINK' && normalizeString(element.getAttribute('rel')) === 'stylesheet';

        return Promise.resolve(isScript || isStyle);
    }

    /**
     * Verifies if the response is eligible for integrity validation. I.E.:
     *
     * * `same-origin`
     * * `cross-origin` on a CORS-enabled request
     *
     * More info in https://w3c.github.io/webappsec-subresource-integrity/#is-response-eligible
     */
    private async isEligibleForIntegrityValidation(evt: FetchEnd): Promise<boolean> {
        debug('Is eligible for integrity validation?');

        const { element, resource } = evt;
        const resourceOrigin: string = new URL(resource).origin;

        if (this.origin === resourceOrigin) {
            return true;
        }

        // cross-origin scripts need to be loaded with a valid "crossorigin" attribute (ie.: anonymous or use-credentials)
        const crossorigin = normalizeString(element.getAttribute('crossorigin'));

        if (!crossorigin) {
            await this.context.report(resource, element, `Cross-origin scripts need a "crossorigin" attribute to be eligible for integrity validation`);

            return false;
        }

        const validCrossorigin = crossorigin === 'anonymous' || crossorigin === 'use-credentials';

        if (!validCrossorigin) {
            await this.context.report(resource, element, `Attribute "crossorigin" doesn't have a valid value, should "anonymous" or "use-credentials": crossorigin="${crossorigin}"`);
        }

        return validCrossorigin;
    }

    /** Checks if the element that triggered the download has the `integrity` attribute. */
    private async hasIntegrityAttribute(evt: FetchEnd): Promise<boolean> {
        debug('has integrity attribute?');
        const { element, resource } = evt;
        const integrity = element.getAttribute('integrity');

        if (!integrity) {
            await this.context.report(resource, element, `Resource ${resource} requested without the "integrity" attribute`);
        }

        return !!integrity;
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
    private async isIntegrityFormatValid(evt: FetchEnd): Promise<boolean> {
        debug('Is integrity attribute valid?');
        const { element, resource } = evt;
        const integrity = element.getAttribute('integrity');
        const integrityRegExp = /^sha(256|384|512)-/;
        const integrityValues = integrity.split(/\s+/);
        let highestAlgorithmPriority = 0;
        const that = this;

        const areFormatsValid = await everySeries(integrityValues, async (integrityValue) => {
            const results = integrityRegExp.exec(integrityValue);
            const isValid = Array.isArray(results);

            if (!isValid) {
                await that.context.report(resource, element, `The format of the "integrity" attribute should be "sha(256|384|512)-HASH": ${integrity.substr(0, 10)}…`);

                return false;
            }

            const algorithm = `sha${results[1]}`;
            const algorithmPriority = algorithms[algorithm];

            highestAlgorithmPriority = Math.max(algorithmPriority, highestAlgorithmPriority);

            return true;
        });

        if (!areFormatsValid) {
            return false;
        }

        const baseline = algorithms[this.baseline];
        const meetsBaseline = highestAlgorithmPriority >= baseline;

        if (!meetsBaseline) {
            await this.context.report(resource, element, `The hash algorithm "${algorithms[highestAlgorithmPriority]}" doesn't meet the baseline "${this.baseline}"`);
        }

        return meetsBaseline;
    }

    /**
     * Checks if the resources is being delivered via HTTPS.
     *
     * More info: https://w3c.github.io/webappsec-subresource-integrity/#non-secure-contexts
     */
    private async isSecureContext(evt: FetchEnd): Promise<boolean> {
        debug('Is delivered on a secure context?');
        const { element, resource } = evt;
        const protocol = new URL(resource).protocol;
        const isSecure = protocol === 'https:';

        if (!isSecure) {
            await this.context.report(resource, element, `The resource is not delivered via a secure context`);
        }

        return isSecure;
    }

    /**
     * Calculates if the hash is the right one for the downloaded resource.
     *
     * An `integrity` attribute can have multiple hashes for the same algorithm and it will
     * pass as long as one validates.
     *
     * More info: https://w3c.github.io/webappsec-subresource-integrity/#does-response-match-metadatalist
     */
    private async hasRightHash(evt: FetchEnd): Promise<boolean> {
        debug('Does it have the right hash?');
        const { element, resource, response } = evt;
        const integrity = element.getAttribute('integrity');
        const integrities = integrity.split(/\s+/);
        const calculatedHashes: Map<string, string> = new Map();
        // const that = this;

        const isOK = integrities.some((integrityValue) => {
            const integrityRegExp = /^sha(256|384|512)-(.*)$/;
            const [, bits, hash] = integrityRegExp.exec(integrityValue);
            const calculatedHash = calculatedHashes.has(bits) ?
                calculatedHashes.get(bits) :
                this.calculateHash(response.body.content, `sha${bits}`);

            calculatedHashes.set(bits, calculatedHash);

            return hash === calculatedHash;
        });

        if (!isOK) {
            const hashes: Array<string> = [];

            calculatedHashes.forEach((value, key) => {
                hashes.push(`sha${key}-${value}`);
            });

            await this.context.report(resource, element, `The hash in the "integrity" attribute doesn't match the received payload.
Expected: ${integrities.join(', ')}
Actual:   ${hashes.join(', ')}`);
        }

        return isOK;
    }

    /** Validation entry point. */
    private async validateResource(evt: FetchEnd) {

        const validations = [
            this.isScriptOrLink,
            this.isEligibleForIntegrityValidation,
            this.hasIntegrityAttribute,
            this.isIntegrityFormatValid,
            this.isSecureContext,
            this.hasRightHash
        ].map((fn) => {
            // Otherwise `this` will be undefined when we call to the fn inside `every`
            return fn.bind(this);
        });

        debug(`Validating integrity of: ${evt.resource}`);

        await everySeries(validations, async (validation) => {
            return await validation(evt);
        });
    }

    /** Sets the `origin` property using the initial request. */
    private setOrigin(evt: FetchEnd): void {
        const { resource } = evt;

        this.origin = new URL(resource).origin; // Our @types/node doesn't have it
    }

    public constructor(context: HintContext) {
        this.context = context;
        this.resources = new Map();
        this.baseline = context.hintOptions ?
            context.hintOptions.baseline :
            this.baseline;

        context.on('fetch::end::script', this.validateResource.bind(this));
        context.on('fetch::end::css', this.validateResource.bind(this));
        context.on('fetch::end::html', this.setOrigin.bind(this));
    }
}
