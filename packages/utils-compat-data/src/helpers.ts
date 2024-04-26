import { CompatStatement, Identifier } from '@mdn/browser-compat-data/types';
import { getVendorPrefix, getUnprefixed } from '@hint/utils-css';

/**
 * Retrieve the feature for the provided name, accounting for prefixes.
 *
 * @param context The scope where the feature should exist as a child (e.g. `mdn.html.elements`)
 * @param name The name of the feature, including prefixes (e.g. `-webkit-keyframes`)
 * @returns A tuple of the feature and extracted prefix (if any).
 */
export const getFeatureData = (context: (Identifier & {__compat?: CompatStatement}) | undefined, name: string): [Identifier & {__compat?: CompatStatement} | undefined, string, string] => {
    if (!context || context[name]) {
        return [context && context[name], '', name];
    }

    const prefix = getVendorPrefix(name);
    const unprefixedName = getUnprefixed(name);

    return [context[unprefixedName], prefix, unprefixedName];
};
