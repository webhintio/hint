import { Identifier } from 'mdn-browser-compat-data/types';
import { vendor } from 'postcss';

import { mdn } from './browser-compat-data';

import { getUnsupportedBrowsers, UnsupportedBrowsers } from './browsers';
import { getCachedValue } from './cache';
import { getFeatureData } from './helpers';

const selectorParser = require('postcss-selector-parser');
const valueParser = require('postcss-value-parser');

export type DeclarationQuery = {
    property: string;
    value?: string;
};

export type RuleQuery = {
    rule: string;
};

export type SelectorQuery = {
    selector: string;
};

/**
 * Extract relevant tokens from a parsed CSS value.
 * Only `function` and `word` are interesting from a
 * compatibility standpoint as other tokens represent
 * separators and user-defined strings.
 */
const getTokens = (nodes: any[]): [string, string][] => {
    let tokens: [string, string][] = [];

    for (const node of nodes) {
        if (node.type === 'function' || node.type === 'word') {
            const prefix = vendor.prefix(node.value);
            const unprefixed = vendor.unprefixed(node.value);

            tokens.push([prefix, unprefixed]);
        }

        if (node.nodes) {
            tokens = [...tokens, ...getTokens(node.nodes)];
        }
    }

    return tokens;
};

/**
 * Determine if part of a CSS value is supported. Iterates through all
 * sub-features in the provided context, using `matches` data to test
 * each tokenized string from the value.
 */
const getPartialValueUnsupported = (context: Identifier, value: string, browsers: string[]): UnsupportedBrowsers | null => {
    const prefix = vendor.prefix(value);
    const unprefixedValue = vendor.unprefixed(value);
    const tokens = getTokens(valueParser(value).nodes);

    for (const entry of Object.values(context)) {

        const matches = entry.__compat && entry.__compat.matches;

        if (!matches) {
            continue;
        }

        if (matches.regex_value && new RegExp(matches.regex_value).exec(unprefixedValue)) {
            return getUnsupportedBrowsers(entry, prefix, browsers);
        }

        if (matches.keywords) {
            for (const [tokenPrefix, tokenValue] of tokens) {
                if (matches.keywords.includes(tokenValue)) {
                    return getUnsupportedBrowsers(entry, tokenPrefix, browsers);
                }
            }
        }

        if (matches.regex_token) {
            const regexToken = matches.regex_token && new RegExp(matches.regex_token);

            for (const [tokenPrefix, tokenValue] of tokens) {
                if (regexToken && regexToken.exec(tokenValue)) {
                    return getUnsupportedBrowsers(entry, tokenPrefix, browsers);
                }
            }
        }
    }

    return null;
};

/**
 * Determine if the provided CSS value is supported, first by looking for an
 * exact match for the full value, falling back to search for a partial match.
 */
const getValueUnsupported = (context: Identifier, value: string, browsers: string[]): UnsupportedBrowsers | null => {
    const [data, prefix] = getFeatureData(context, value);

    if (data) {
        return getUnsupportedBrowsers(data, prefix, browsers);
    }

    return getPartialValueUnsupported(context, value, browsers);
};

/**
 * Determine if the provided CSS declaration consisting of a property
 * and optionally a value is supported (e.g. `border-radius` or `display: grid`).
 */
export const getDeclarationUnsupported = (feature: DeclarationQuery, browsers: string[]): UnsupportedBrowsers | null => {
    const key = `css-declaration:${feature.property}|${feature.value || ''}`;

    return getCachedValue(key, browsers, () => {
        const [data, prefix] = getFeatureData(mdn.css.properties, feature.property);

        if (data && feature.value) {
            return getValueUnsupported(data, feature.value, browsers);
        }

        return getUnsupportedBrowsers(data, prefix, browsers);
    });
};

/**
 * Determine if the provided CSS at-rule is supported (e.g. `keyframes`).
 */
export const getRuleUnsupported = (feature: RuleQuery, browsers: string[]): UnsupportedBrowsers | null => {
    return getCachedValue(`css-rule:${feature.rule}`, browsers, () => {
        const [data, prefix] = getFeatureData(mdn.css['at-rules'], feature.rule);

        return getUnsupportedBrowsers(data, prefix, browsers);
    });
};

const getPseudoSelectorUnsupported = (value: string, browsers: string[]): UnsupportedBrowsers | null => {
    const name = value.replace(/^::?/, ''); // Strip leading `:` or `::`.

    return getCachedValue(`css-pseudo-selector:${name}`, browsers, () => {
        const [data, prefix] = getFeatureData(mdn.css.selectors, name);

        return getUnsupportedBrowsers(data, prefix, browsers);
    });
};

/**
 * Determine if the provided CSS selector is supported (e.g. `:valid`).
 *
 * Can be passed any selector, but currently only validates pseudo-selectors
 * as most other selector types already have broad support and certain other
 * special cases (e.g. newer attribute and combinator selectors) need special
 * handling to map to the MDN data (which hasn't been done yet).
 */
export const getSelectorUnsupported = (feature: SelectorQuery, browsers: string[]): UnsupportedBrowsers | null => {
    const parser = selectorParser();
    const root = parser.astSync(feature.selector); // eslint-disable-line no-sync

    const unsupported: UnsupportedBrowsers = {
        browsers: [],
        details: new Map()
    };

    // https://github.com/postcss/postcss-selector-parser/blob/master/API.md#containerwalk-proxies
    root.walkPseudos((node: { value: string }) => {
        const result = getPseudoSelectorUnsupported(node.value, browsers);

        if (result) {
            unsupported.browsers = [...unsupported.browsers, ...result.browsers];

            /*
             * Note: Details can be incorrect if multiple parts of a selector
             * are unsupported. Currently details will be set based on the
             * last part of the selector which was unsupported.
             *
             * TODO: Fix by requiring callers to parse the selector instead.
             */
            for (const [browser, details] of result.details) {
                unsupported.details.set(browser, details);
            }
        }
    });

    return unsupported.browsers.length ? unsupported : null;
};
