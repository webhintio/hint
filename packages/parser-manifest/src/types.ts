import * as ajv from 'ajv';
import { FetchEnd } from 'sonarwhal/dist/src/lib/types';

/* eslint-disable camelcase */

/*
 * Platform
 *
 * https://www.w3.org/TR/appmanifest/#multi-purpose-members
 * https://github.com/w3c/manifest/wiki/Platforms
 */

export enum ManifestPlatform {
    'itunes',
    'play',
    'window'
}

/*
 * ImageResource
 * https://www.w3.org/TR/appmanifest/#imageresource-and-its-members
 */

export type ManifestImageResource = {
    platform?: ManifestPlatform;
    purpose:
        'any' |
        'badge' |
        'any badge' |
        'badge any';
    sizes?: string;
    src: string;
    type?: string;
};

/*
 * ExternalApplicationResources
 * https://www.w3.org/TR/appmanifest/#externalapplicationresource-and-its-members
 */

export type ManifestExternalApplicationResourceFingerprint = {
    type: string;
    value: string;
};

export type ManifestExternalApplicationResources = {
    platform: ManifestPlatform;
    fingerprints?: Array<ManifestExternalApplicationResourceFingerprint>;
    id?: string;
    min_version?: string;
    url?: string;
};

/*
 * ServiceWorkerRegistrationObject
 * https://www.w3.org/TR/appmanifest/#the-serviceworkerregistrationobject-dictionary-and-its-members
 */
export type ServiceWorkerRegistrationObject = {
    scope?: string;
    src?: string;
    type:
        'classic' |
        'module';
    update_via_cache:
        'all' |
        'imports' |
        'none';
};

/*
 *  WebAppManifest
 *  https://www.w3.org/TR/appmanifest/#webappmanifest-dictionary
 */

export type Manifest = {
    background_color?: string;
    categories?: Array<
        'books' |
        'business' |
        'education' |
        'entertainment' |
        'finance' |
        'fitness' |
        'food' |
        'games' |
        'government' |
        'health' |
        'kids' |
        'lifestyle' |
        'magazines' |
        'medical' |
        'music' |
        'navigation' |
        'news' |
        'personalization' |
        'photo' |
        'politics' |
        'productivity' |
        'security' |
        'shopping' |
        'social' |
        'sports' |
        'travel' |
        'utilities' |
        'weather'
    >;
    description?: string;
    dir:
        'auto' |
        'ltr' |
        'rtl';
    display:
        'browser' |
        'fullscreen' |
        'minimal-ui' |
        'standalon';
    iarc_rating_id?: string;
    icons?: Array<ManifestImageResource>;
    lang?: string;
    name?: string;
    orientation:
        'any' |
        'landscape' |
        'landscape-primary' |
        'landscape-secondary' |
        'natural' |
        'portrait' |
        'portrait-primary' |
        'portrait-secondar';
    prefer_related_applications: boolean;
    related_applications?: Array<ManifestExternalApplicationResources>;
    scope?: string;
    screenshots?: Array<ManifestImageResource>;
    serviceworker?: ServiceWorkerRegistrationObject;
    short_name?: string;
    start_url?: string;
    theme_color?: string;

    /*
     * Proprietary manifest members.
     * https://www.w3.org/TR/appmanifest/#proprietary-extensions
     */
    [other: string]: any;
};

export type ManifestInvalidJSON = FetchEnd & {
    /** The parse JSON error. */
    error: Error;
};

export type ManifestInvalidSchema = FetchEnd & {
    /** The parse errors as returned by ajv. */
    errors: Array<ajv.ErrorObject>;
    /** The errors in a more human readable format. */
    prettifiedErrors: Array<string>;
};

export type ManifestParsed = FetchEnd & {
    /** The content of manifest parsed */
    parsedContent: Manifest;
};
