import { UnsupportedBrowsers } from './browsers';

import {
    getDeclarationUnsupported,
    getRuleUnsupported,
    getSelectorUnsupported,
    DeclarationQuery,
    RuleQuery,
    SelectorQuery
} from './css';

import {
    getAttributeUnsupported,
    getElementUnsupported,
    AttributeQuery,
    ElementQuery
} from './html';

export type FeatureQuery = AttributeQuery | DeclarationQuery | ElementQuery | RuleQuery | SelectorQuery;

/**
 * ```js
 * getUnsupported({ element: 'details' }, ['chrome 74', 'ie 11']); // ['ie 11']
 * getUnsupported({ attribute: 'hidden' }, browsers);
 * getUnsupported({ attribute: 'rel', element: 'link', value: 'noopener' }, ['edge 12', 'firefox 63']); // ['edge 12']
 * getUnsupported({ property: 'border-radius' }, browsers);
 * getUnsupported({ property: 'color', value: '#00FF00FF' }, browsers);
 * getUnsupported({ property: 'transform', value: 'translate3d(0, 0, 10px)' }, browsers);
 * getUnsupported({ rule: '@supports' }, browsers);
 * getUnsupported({ selector: 'input:invalid' }, browsers);
 * ```
 */
export const getUnsupported = (feature: FeatureQuery, browsers: string[]): UnsupportedBrowsers => {
    if ('attribute' in feature) {
        return getAttributeUnsupported(feature, browsers);
    } else if ('element' in feature) {
        return getElementUnsupported(feature, browsers);
    } else if ('property' in feature) {
        return getDeclarationUnsupported(feature, browsers);
    } else if ('rule' in feature) {
        return getRuleUnsupported(feature, browsers);
    }

    return getSelectorUnsupported(feature, browsers);
};

export const getSupported = (feature: FeatureQuery, browsers: string[]): string[] | null => {
    const unsupported = getUnsupported(feature, browsers);

    if (!unsupported) {
        return browsers;
    }

    const supported = browsers.filter((browser) => {
        return !unsupported.includes(browser);
    });

    return supported.length ? supported : null;
};

export const isSupported = (feature: FeatureQuery, browsers: string[]): boolean => {
    return !getUnsupported(feature, browsers);
};
