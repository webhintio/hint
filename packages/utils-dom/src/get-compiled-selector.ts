import { compile, CompiledQuery } from 'css-select';

// TODO: Use quick-lru so that it doesn't grow without bounds
const CACHED_CSS_SELECTORS: Map<string, CompiledQuery> = new Map();

/**
 * Helper to get a compiled cached css-select query function.
 * @param selector css selector
 */
export const getCompiledSelector = (selector: string): CompiledQuery => {
    if (!CACHED_CSS_SELECTORS.has(selector)) {
        CACHED_CSS_SELECTORS.set(selector, compile(selector));
    }

    return CACHED_CSS_SELECTORS.get(selector)!;
};
