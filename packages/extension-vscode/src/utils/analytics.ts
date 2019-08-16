import { trackEvent } from './app-insights';

export type ResultData = {
    hints: import('hint').IHintConstructor[];
    problems: import('hint').Problem[];
};

const enum HintStatus {
    passed = 'passed',
    failed = 'failed',
    fixed = 'fixed',
    fixing = 'fixing'
}

type HintStatusMap = {
    [hintKey: string]: HintStatus;
};

type ProblemCountMap = {
    [hintId: string]: number;
};

// Remember per-document results for analytics.
const prevProblems = new Map<string, ProblemCountMap>();
const nextProblems = new Map<string, ProblemCountMap>();
const lastSaveTimes = new Map<string, number>();
const twoMinutes = 1000 * 60 * 2;

const determineHintStatus = (prev: ProblemCountMap, next: ProblemCountMap) => {
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

const toTrackedResult = (data: ResultData) => {
    const result: ProblemCountMap = {};
    const ids = data.hints.map((hint) => {
        return hint.meta.id;
    });

    for (const id of ids) {
        result[id] = data.problems.filter((problem) => {
            return problem.hintId === id;
        }).length;
    }

    return result;
};

const trackOpen = (result: ProblemCountMap) => {
    trackEvent('vscode-open', determineHintStatus({}, result));
};

export const trackClose = (uri: string) => {
    prevProblems.delete(uri);
    nextProblems.delete(uri);
    lastSaveTimes.delete(uri);
};

export const trackResult = (uri: string, result: ResultData) => {
    const problems = toTrackedResult(result);

    if (prevProblems.has(uri)) {
        nextProblems.set(uri, problems);
    } else {
        prevProblems.set(uri, problems);
        trackOpen(problems);
    }
};

export const trackSave = (uri: string) => {
    const prev = prevProblems.get(uri);
    const next = nextProblems.get(uri);
    const lastSave = lastSaveTimes.get(uri);
    const now = Date.now();

    if (!prev || !next) {
        return;
    }

    // Throttle tracking saves to reduce redundant reports when autosave is on.
    if (lastSave && now - lastSave < twoMinutes) {
        return;
    }

    prevProblems.set(uri, next);
    nextProblems.delete(uri);

    trackEvent('vscode-save', determineHintStatus(prev, next));

    lastSaveTimes.set(uri, now);
};
