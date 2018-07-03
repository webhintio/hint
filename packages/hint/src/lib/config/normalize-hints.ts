import { HintConfig, HintsConfigObject } from '../types';

/**
 * @fileoverview Used for normalizing hints that are passed as configuration.
 * Hints are stored as objects internally, so this module converts hint arrays
 * to objects or if an object is passed, it returns it.
 */

const DEFAULT_HINT_LEVEL = 'error';

const shortHandHintPrefixes = {
    '-': 'off',
    '?': 'warning'
};

type NormalizedHint = {
    hintLevel: string;
    hintName: string;
};

const normalizeHint = (hint: string): NormalizedHint => {
    let hintLevel: string;
    let hintName: string;

    for (const prefix in shortHandHintPrefixes) {
        if (hint.startsWith(prefix)) {
            // Matches for hint like: `?hint1`
            hintLevel = shortHandHintPrefixes[prefix];
            hintName = hint.substr(1, hint.length - 1);
            break;
        }
    }

    if (!hintLevel) {
        // Matches for a hint like: `hint1` or `hint1:warn`
        [hintName, hintLevel] = hint.split(':');
        hintLevel = hintLevel || DEFAULT_HINT_LEVEL;
    }

    return {
        hintLevel,
        hintName
    };
};

/**
 * Normalized all hints passed as configuration
 * Ex.:
 * * ["hint1"] => { "hint1": "error" }
 * * { "hint1": "warning" } => { "hint1": "warning" }
 * * ["hint1:warning"] => { "hint1": "warning" }
 */
export default function normalizeHints(hints: HintsConfigObject | Array<HintConfig>): HintsConfigObject {
    if (!Array.isArray(hints)) {
        return hints;
    }

    const result = {};

    for (const hint of hints) {
        if (typeof hint === 'string') {
            const { hintName, hintLevel } = normalizeHint(hint);

            result[hintName] = hintLevel;
        } else if (Array.isArray(hint)) {
            const [hintKey, hintConfig] = hint;
            const { hintName, hintLevel } = normalizeHint(hintKey as string);

            result[hintName] = [hintLevel];

            if (hintConfig) {
                result[hintName].push(hintConfig);
            }
        } else {
            throw new Error(`Invalid hint type specified: "${hint}". Arrays and objects are supported.`);
        }
    }

    return result;
}
