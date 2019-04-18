type Value = string[] | null;

const cache = new Map<string, Map<string[], Value>>();

const _hasCachedValue = (key: string, browsers: string[]): boolean => {
    return cache.has(key) && cache.get(key)!.has(browsers);
};

const _getCachedValue = (key: string, browsers: string[]): Value => {
    return cache.has(key) && cache.get(key)!.get(browsers) || null;
};

const _setCachedValue = (key: string, browsers: string[], value: Value): Value => {
    if (!cache.has(key)) {
        cache.set(key, new Map());
    }

    cache.get(key)!.set(browsers, value);

    return value;
};

/**
 * Cache a set of unsupported browsers for the provided key and target
 * browsers. Speeds up access for repeat queries which are common when
 * processing source code.
 */
export const getCachedValue = (key: string, browsers: string[], getValue: () => Value) => {
    if (_hasCachedValue(key, browsers)) {
        return _getCachedValue(key, browsers);
    }

    return _setCachedValue(key, browsers, getValue());
};
