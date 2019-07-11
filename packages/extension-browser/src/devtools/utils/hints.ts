import isEqual = require('lodash/isEqual');

import { Config, Results } from '../../shared/types';

import * as storage from './storage';

export const enum HintStatus {
    passed = 'passed',
    failed = 'failed',
    fixed = 'fixed',
    fixing = 'fixing'
}

type ScanStatus = {
    config?: Config;
    hints: { [id: string]: number };
    url?: string;
}

const statusKey = `webhint-hint-status`;

/**
 * Extract pass/fail/fixing/fixed status for each hint from scan results.
 * A hint is considered fixed when passing after failing the previous scan.
 * Fixing is when the number of failures decreases between scans.
 *
 * To minimize false-positives for the 'fixing' and 'fixed' statuses, the
 * previous scan must occur on the same URL with the same configuration.
 */
export const determineHintStatus = (config: Config, results: Results, s = storage): { [key: string]: HintStatus } => {
    const hintStatus: { [key: string]: HintStatus } = {};
    const status: ScanStatus = { config, hints: {}, url: results.url };

    let saved: ScanStatus | undefined = s.getItem(statusKey);

    // If the configuration has changed, ignore the previous scan.
    if (!saved || !saved.hints || status.url !== saved.url || !isEqual(saved.config, status.config)) {
        saved = { hints: {} };
    }

    // Determine the current status for each hint.
    for (const category of results.categories) {
        for (const hint of category.hints) {
            const hintKey = `hint-${hint.id}`;
            const savedCount = saved.hints[hintKey] || 0;

            status.hints[hintKey] = hint.problems.length;

            if (hint.problems.length) {
                if (savedCount > hint.problems.length) {
                    hintStatus[hintKey] = HintStatus.fixing;
                } else {
                    hintStatus[hintKey] = HintStatus.failed;
                }
            } else if (savedCount > 0) {
                hintStatus[hintKey] = HintStatus.fixed;
            } else {
                hintStatus[hintKey] = HintStatus.passed;
            }
        }
    }

    // Remember the current status *locally* for the next scan.
    s.setItem(statusKey, status);

    // Report only the status of hints to avoid logging user-provided data.
    return hintStatus;
};
