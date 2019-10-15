export type Activity = {
    [key in keyof {

        /**
         * 28-entry list of 1 (active) and 0 (inactive) days.
         * (e.g. `"1001100110011001100110011001"`)
         */
        last28Days: string;

        /**
         * Date in ISO 8601 format (toISOString) with time at zero.
         * (e.g. `"2019-10-04T00:00:00.000Z"`)
         */
        lastUpdated: string;

    }]: string;
};

const getISODateString = () => {
    const date = new Date(Date.now());

    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    return date.toISOString();
};

const getDaysBetweenUpdates = (currentUpdate: string, lastUpdated?: string) => {
    if (!lastUpdated) {
        return 1;
    }

    const deltaMS = new Date(currentUpdate).getTime() - new Date(lastUpdated).getTime();

    return deltaMS / 1000 / 60 / 60 / 24;
};

const initializeActivity = (): Activity => {
    const lastUpdated = '';
    const last28Days = ''.padEnd(28, '0');

    return { last28Days, lastUpdated };
};

/**
 * Retrieve an updated activity log if and only if it has not already
 * been updated in the current UTC day.
 */
export const getUpdatedActivity = (previousActivity?: Activity) => {
    const activity = previousActivity || initializeActivity();
    const currentUpdate = getISODateString();
    const delta = getDaysBetweenUpdates(currentUpdate, activity.lastUpdated);

    // Only update activity once a new date is reached.
    if (delta < 1) {
        return null;
    }

    // Start with today's activity plus inactivity for past `delta` days (maxing out at 28).
    activity.last28Days = '1'.padEnd(Math.min(delta, 28), '0') +
        // Add remaining activity from previous `28 - delta` days.
        activity.last28Days.slice(0, -delta);

    activity.lastUpdated = currentUpdate;

    return activity;
};
