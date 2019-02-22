/**
 * @fileoverview Ensure vendor-prefixed versions of a CSS property are listed
 * before the unprefixed version.
 */

import { vendor, Declaration, Rule } from 'postcss';

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { StyleEvents, StyleParse } from '@hint/parser-css';

import meta from './meta';

const debug: debug.IDebugger = d(__filename);

type DeclarationPair = {
    lastPrefixed: Declaration;
    unprefixed: Declaration;
};

/** Convert `NodeSource` details to a `ProblemLocation`. */
const getLocation = (decl: Declaration): ProblemLocation => decl.source && decl.source.start || {
    column: 0,
    line: 0
};

/** Generate a report message from an invalid pair. */
const formatMessage = (invalidPair: DeclarationPair): string => {
    // Handle prefixed properties (e.g. `appearance` and `-webkit-appearance`).
    let name = invalidPair.unprefixed.prop;
    let prefixedName = invalidPair.lastPrefixed.prop;

    // Handle prefixed values (e.g. `display: grid` and `display: -ms-grid`).
    if (name === prefixedName) {
        name = `${invalidPair.unprefixed}`;
        prefixedName = `${invalidPair.lastPrefixed}`;
    }

    return `'${name}' should be listed after '${prefixedName}'.`;
};

/** Determine if the order of a prefixed/unprefixed pair is valid. */
const validatePair = (pair: Partial<DeclarationPair>): boolean => {
    // Valid if only prefixed or only unprefixed versions exist.
    if (!pair.lastPrefixed || !pair.unprefixed) {
        return false;
    }

    const prefixedLocation = getLocation(pair.lastPrefixed);
    const unprefixedLocation = getLocation(pair.unprefixed);

    // Valid if last prefixed line is before unprefixed line.
    if (prefixedLocation.line < unprefixedLocation.line) {
        return false;
    }

    // Invalid if last prefixed line is after unprefixed line.
    if (prefixedLocation.line > unprefixedLocation.line) {
        return true;
    }

    // Both are on the same line: valid only if last prefixed column is first.
    return prefixedLocation.column > unprefixedLocation.column;
};

/** Determine if the order of all properties within a rule block are valid. */
const validateRule = (rule: Rule): DeclarationPair[] => {
    const map = new Map<string, Partial<DeclarationPair>>();

    rule.walkDecls((decl) => {
        const name = decl.prop;
        const baseName = vendor.unprefixed(name);

        const value = decl.value;
        const baseValue = vendor.unprefixed(value);

        if (!map.has(baseName)) {
            map.set(baseName, {});
        }

        const pair = map.get(baseName)!;

        if (name === baseName && value === baseValue) {
            pair.unprefixed = decl;
        } else {
            pair.lastPrefixed = decl;
        }
    });

    return [...map.values()].filter(validatePair) as DeclarationPair[];
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class CssPrefixOrderHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        context.on('parse::end::css', async ({ ast, resource }: StyleParse) => {
            debug(`Validating hint css-prefix-order`);

            await ast.walkRules(async (rule) => {
                for (const invalidPair of validateRule(rule)) {
                    const message = formatMessage(invalidPair);
                    const location = getLocation(invalidPair.unprefixed);

                    await context.report(resource, message, { location });
                }
            });
        });
    }
}
