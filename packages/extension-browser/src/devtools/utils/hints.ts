import isEqual = require('lodash/isEqual');

import { Config, Results } from '../../shared/types';

import * as storage from './storage';

export const enum HintStatus {
    passed = 'passed',
    failed = 'failed',
    fixed = 'fixed'
}

const statusKey = `webhint-hint-status`;

/**
 * Extract pass/fail/fixed status for each hint from scan results.
 * A hint is considered fixed when passing after failing the previous scan.
 *
 * To minimize false-positives for the 'fixed' status, the previous scan must
 * occur on the same URL with the same configuration.
 */
export const determineHintStatus = (config: Config, results: Results, s = storage): { [key: string]: HintStatus } => {
    const hintStatus: { [key: string]: HintStatus } = {};
    const status = { config, url: results.url };

    let prevStatus: { [key: string]: string | undefined } = s.getItem(statusKey) || {};

    // If the configuration has changed, ignore the previous scan.
    if (status.url !== prevStatus.url || !isEqual(prevStatus.config, status.config)) {
        prevStatus = {};
    }

    // Determine the current status for each hint.
    for (const category of results.categories) {
        for (const hint of category.hints) {
            const hintKey = `hint-${hint.id}`;

            if (hint.problems.length) {
                hintStatus[hintKey] = HintStatus.failed;
            } else if (prevStatus[hintKey] === HintStatus.failed) {
                hintStatus[hintKey] = HintStatus.fixed;
            } else {
                hintStatus[hintKey] = HintStatus.passed;
            }
        }
    }

    // Remember the current status *locally* for the next scan.
    s.setItem(statusKey, { ...hintStatus, ...status });

    // Report only the status of hints to avoid logging user-provided data.
    return hintStatus;
};
