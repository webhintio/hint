type Options = {
    enable?: string[];
    ignore?: string[];
};

/**
 * Determine the set of ignored features, given the provided defaults
 * and user-specified `ignore` and/or `enable` options.
 */
export const resolveIgnore = (defaults: string[], options?: Options) => {
    const ignore = new Set(defaults);

    if (options && options.ignore) {
        for (const entry of options.ignore) {
            ignore.add(entry);
        }
    }

    if (options && options.enable) {
        for (const entry of options.enable) {
            ignore.delete(entry);
        }
    }

    return ignore;
};
