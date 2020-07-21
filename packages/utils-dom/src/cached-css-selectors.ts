import { CompiledQuery } from 'css-select';

// TODO: Use quick-lru so that it doesn't grow without bounds
export const CACHED_CSS_SELECTORS: Map<string, CompiledQuery> = new Map();
