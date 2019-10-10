import difference = require('lodash/difference');
import intersection = require('lodash/intersection');
import union = require('lodash/union');

import { getSupported } from '@hint/utils-compat-data';

import { parseSupports, Declaration, DeclarationGroup } from './parse-supports';

/**
 * Represents errors encountered while filtering bad input.
 * These will be caught and used to return `null`.
 *
 * The type is unique to this file to avoid accidentally exposing
 * these errors to or catching unrelated errors from some other part
 * of the code.
 */
class InvalidInputError extends Error {
    public constructor(message: string) {
        super(message);
    }
}

/**
 * Recursively filter provided browsers based on support for the given
 * `Declaration` or `DeclarationGroup` and its children.
 */
const filterItem = (item: Declaration | DeclarationGroup, browsers: string[]): string[] => {
    if ('prop' in item) {
        const supportsProperty = getSupported({ property: item.prop }, browsers);
        const supportsValue = supportsProperty && getSupported({ property: item.prop, value: item.value }, supportsProperty);

        return supportsValue || [];
    }

    switch (item.type) {
        case 'and':
            return intersection(...item.nodes.map((child) => {
                return filterItem(child, browsers);
            }));
        case 'or':
            return union(...item.nodes.map((child) => {
                return filterItem(child, browsers);
            }));
        case 'not':
            return difference(browsers, filterItem(item.nodes[0], browsers));
        default:
            throw new InvalidInputError('Unrecognized group type');
    }
};

/**
 * Given the params from an `@supports` rule and a list of target browsers,
 * return a new list containing only the browsers which would apply the rules
 * within the `@supports` block.
 *
 * ```js
 * filterSupports('(display: grid)', ['edge 15', 'edge 16']); // returns ['edge 16']
 * ```
 */
export const filterSupports = (params: string, browsers: string[]): string[] | null => {
    const hasAtSupports = getSupported({ rule: 'supports'}, browsers);

    if (!hasAtSupports) {
        return null;
    }

    const root = parseSupports(params);

    if (!root) {
        return null;
    }

    try {
        const supported = filterItem(root, hasAtSupports);

        return supported.length ? supported : null;
    } catch (e) {
        // Gracefully exit evaluation for expected errors from invalid input.
        if (e instanceof InvalidInputError) {
            return null;
        }

        // But let unexpected errors bubble up.
        throw e;
    }
};
