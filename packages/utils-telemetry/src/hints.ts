export const enum HintStatus {
    passed = 'passed',
    failed = 'failed',
    fixed = 'fixed',
    fixing = 'fixing'
}

export type HintStatusMap = {
    [hintKey: string]: HintStatus;
};

export type ProblemCountMap = {
    [hintId: string]: number;
};

/**
 * Extract pass/fail/fixing/fixed status for each hint from scan results.
 * A hint is considered 'fixed' when passing after failing the previous scan.
 * The 'fixing' status is when the number of failures decreases between scans.
 *
 * To avoid false-positives for the 'fixing' and 'fixed' statuses, callers
 * should ensure the previous scan occurs on the same URL with the same
 * configuration.
 */
export const determineHintStatus = (prev: ProblemCountMap, next: ProblemCountMap) => {
    const status: HintStatusMap = {};

    for (const id of Object.keys(next)) {
        const hintKey = `hint-${id}`;
        const prevCount = prev[id] || 0;
        const nextCount = next[id] || 0;

        if (nextCount) {
            if (prevCount > nextCount) {
                status[hintKey] = HintStatus.fixing;
            } else {
                status[hintKey] = HintStatus.failed;
            }
        } else if (prevCount > 0) {
            status[hintKey] = HintStatus.fixed;
        } else {
            status[hintKey] = HintStatus.passed;
        }
    }

    return status;
};
