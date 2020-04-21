import { Identifier } from 'mdn-browser-compat-data/types';
import { vendor } from 'postcss';

/**
 * Retrieve the feature for the provided name, accounting for prefixes.
 *
 * @param context The scope where the feature should exist as a child (e.g. `mdn.html.elements`)
 * @param name The name of the feature, including prefixes (e.g. `-webkit-keyframes`)
 * @returns A tuple of the feature and extracted prefix (if any).
 */
export const getFeatureData = (context: Identifier, name: string): [Identifier, string, string] => {
    if (!context || context[name]) {
        return [context && context[name], '', name];
    }

    const prefix = vendor.prefix(name);
    const unprefixedName = vendor.unprefixed(name);

    return [context[unprefixedName], prefix, unprefixedName];
};
