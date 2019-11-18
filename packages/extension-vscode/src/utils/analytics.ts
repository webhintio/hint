import * as Configstore from 'configstore';

import {
    determineHintStatus,
    enabled,
    getUpdatedActivity,
    ProblemCountMap,
    trackEvent
} from '@hint/utils-telemetry';

export type ResultData = {
    hints: import('hint').IHintConstructor[];
    problems: import('@hint/utils-types').Problem[];
};

export type TelemetryState = 'ask' | 'disabled' | 'enabled';

const activityKey = 'webhint-activity';
const configstore = new Configstore('vscode-webhint');

// Remember per-document results for analytics.
const prevProblems = new Map<string, ProblemCountMap>();
const nextProblems = new Map<string, ProblemCountMap>();
const languageIds = new Map<string, string>();
const lastSaveTimes = new Map<string, number>();
const twoMinutes = 1000 * 60 * 2;

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

/**
 * Report once per UTC day that a user is active (has opened a recognized file).
 * Data includes `last28Days` (e.g. `"1001100110011001100110011001"`)
 * and `lastUpdated` (e.g. `"2019-10-04T00:00:00.000Z"`).
 */
const trackActive = (storage: Configstore) => {
    // Don't count a user as active if telemetry is disabled.
    if (!enabled()) {
        return;
    }

    const activity = getUpdatedActivity(storage.get(activityKey));

    if (activity) {
        storage.set(activityKey, activity);
        trackEvent('vscode-activity', activity);
    }
};

const trackOpen = (result: ProblemCountMap, languageId: string, storage: Configstore) => {
    const status = determineHintStatus({}, result);

    trackEvent('vscode-open', { ...status, languageId });
    trackActive(storage);
};

export const trackOptIn = (telemetryEnabled: TelemetryState, everEnabledTelemetry: boolean) => {
    if (telemetryEnabled === 'enabled' && !everEnabledTelemetry) {
        trackEvent('vscode-telemetry');
    }
};

export const trackClose = (uri: string) => {
    prevProblems.delete(uri);
    nextProblems.delete(uri);
    languageIds.delete(uri);
    lastSaveTimes.delete(uri);
};

export const trackResult = (uri: string, languageId: string, result: ResultData, storage = configstore) => {
    const problems = toTrackedResult(result);

    languageIds.set(uri, languageId);

    if (prevProblems.has(uri)) {
        nextProblems.set(uri, problems);
    } else {
        prevProblems.set(uri, problems);
        trackOpen(problems, languageId, storage);
    }
};

export const trackSave = (uri: string, languageId: string) => {
    const prev = prevProblems.get(uri);
    const next = nextProblems.get(uri);
    const lastSave = lastSaveTimes.get(uri);
    const now = Date.now();

    if (!prev || !next) {
        return;
    }

    // Throttle tracking saves to reduce redundant reports when autosave is on.
    /* istanbul ignore if */
    if (lastSave && now - lastSave < twoMinutes) {
        return;
    }

    prevProblems.set(uri, next);
    nextProblems.delete(uri);

    const status = determineHintStatus(prev, next);

    trackEvent('vscode-save', { ...status, languageId });

    lastSaveTimes.set(uri, now);
};
