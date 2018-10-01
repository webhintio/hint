import { HintsConfigObject, HintSeverity } from '../types';
import { Severity } from '../types/problems';

/**
 * @fileoverview Used for normalizing hints that are passed as configuration.
 * Hints are stored as objects internally, so this module converts hint arrays
 * to objects or if an object is passed, it returns it.
 */

const DEFAULT_HINT_LEVEL = 'error';

const shortHandHintPrefixes: {[prefix: string]: keyof typeof Severity | undefined} = {
    '-': 'off',
    '?': 'warning'
};

type NormalizedHint = {
    hintLevel: HintSeverity;
    hintName: string;
};

const normalizeHint = (hint: string): NormalizedHint => {
    let hintLevel: keyof typeof Severity | undefined;
    let hintName = '';

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
        [hintName, hintLevel] = hint.split(':') as [string, keyof typeof Severity];
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
export default function normalizeHints(hints: HintsConfigObject | (string | any[])[]): HintsConfigObject {
    if (!Array.isArray(hints)) {
        return hints;
    }

    const result: HintsConfigObject = {};

    for (const hint of hints) {
        if (typeof hint === 'string') {
            const { hintName, hintLevel } = normalizeHint(hint);

            result[hintName] = hintLevel;
        } else if (Array.isArray(hint)) {
            const [hintKey, hintConfig] = hint;
            const { hintName, hintLevel } = normalizeHint(hintKey as string);

            if (hintConfig) {
                result[hintName] = [hintLevel, hintConfig];
            } else {
                result[hintName] = [hintLevel];
            }
        } else {
            throw new Error(`Invalid hint type specified: "${hint}". Arrays and objects are supported.`);
        }
    }

    return result;
}
