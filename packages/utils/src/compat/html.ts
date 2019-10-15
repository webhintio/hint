import { mdn } from './browser-compat-data';
import { Identifier } from 'mdn-browser-compat-data/types';

import { getUnsupportedBrowsers, UnsupportedBrowsers } from './browsers';
import { getCachedValue } from './cache';
import { getFeatureData } from './helpers';

export type AttributeQuery = {
    attribute: string;
    element?: string;
    value?: string;
};

export type ElementQuery = {
    element: string;
};

/**
 * Determine if the provided HTML attribute consisting of a name and optionally
 * a context element and/or value is supported (e.g. `{ attribute: 'hidden' }`
 * or `{ attribute: 'rel', element: 'link', value: 'stylesheet' }`).
 */
export const getAttributeUnsupported = (feature: AttributeQuery, browsers: string[]): UnsupportedBrowsers | null => {
    const key = `html-attribute:${feature.element || ''}|${feature.attribute}|${feature.value || ''}`;

    return getCachedValue(key, browsers, () => {
        let data: Identifier | undefined;
        let prefix = '';
        let unprefixed = '';

        // Search for an element-specific attribute first.
        if (feature.element) {
            const [elementData] = getFeatureData(mdn.html.elements, feature.element);

            [data, prefix, unprefixed] = getFeatureData(elementData, feature.attribute);
        }

        // If no element-specific attribute was found, check for a global attribute.
        if (!data) {
            [data, prefix, unprefixed] = getFeatureData(mdn.html.global_attributes, feature.attribute);
        }

        // Search for a value if provided.
        if (feature.value) {
            [data, prefix, unprefixed] = getFeatureData(data, feature.value);

            // Handle oddly stored input type data (mdn.html.elements.input['input-' + typeValue]).
            if (!data && feature.element === 'input' && feature.attribute === 'type') {
                [data, prefix, unprefixed] = getFeatureData(mdn.html.elements.input, `input-${feature.value}`);
            }
        }

        return getUnsupportedBrowsers(data, prefix, browsers, unprefixed);
    });
};

/**
 * Determine if the provided HTML element is supported (e.g. `details`).
 */
export const getElementUnsupported = (feature: ElementQuery, browsers: string[]): UnsupportedBrowsers | null => {
    return getCachedValue(`html-element:${feature.element}`, browsers, () => {
        const [data, prefix, unprefixed] = getFeatureData(mdn.html.elements, feature.element);

        return getUnsupportedBrowsers(data, prefix, browsers, unprefixed);
    });
};
