import test from 'ava';

import { getUpdatedActivity } from '../../../src/devtools/utils/activity';

const stubDateNow = (when: number) => {
    const now = Date.now;

    Date.now = () => {
        return when;
    };

    return () => {
        Date.now = now;
    };
};

test('It initializes a new activity history when none is provided', (t) => {
    const restore = stubDateNow(Date.UTC(2019, 10 - 1, 1));

    const activity = getUpdatedActivity();

    t.is(activity && activity.last28Days, '1000000000000000000000000000');
    t.is(activity && activity.lastUpdated, '2019-10-01T00:00:00.000Z');

    restore();
});

test('It updates the activity history on a new day', (t) => {
    const restore = stubDateNow(Date.UTC(2019, 10 - 1, 2));

    const activity = getUpdatedActivity({
        last28Days: '1000000000000000000000000010',
        lastUpdated: '2019-10-01T00:00:00.000Z'
    });

    t.is(activity && activity.last28Days, '1100000000000000000000000001');
    t.is(activity && activity.lastUpdated, '2019-10-02T00:00:00.000Z');

    restore();
});

test('It fills in zeros for missing days in the activity history', (t) => {
    const restore = stubDateNow(Date.UTC(2019, 10 - 1, 5));
    const activity = getUpdatedActivity({
        last28Days: '1000000000000000000000000000',
        lastUpdated: '2019-10-01T00:00:00.000Z'
    });

    t.is(activity && activity.last28Days, '1000100000000000000000000000');
    t.is(activity && activity.lastUpdated, '2019-10-05T00:00:00.000Z');

    restore();
});

test('It handles more than 28 missing days in the activity history', (t) => {
    const restore = stubDateNow(Date.UTC(2019, 12 - 1, 1));
    const activity = getUpdatedActivity({
        last28Days: '1000000000000000000000000000',
        lastUpdated: '2019-10-01T00:00:00.000Z'
    });

    t.is(activity && activity.last28Days, '1000000000000000000000000000');
    t.is(activity && activity.lastUpdated, '2019-12-01T00:00:00.000Z');

    restore();
});

test('It does nothing when the activity history is for the same day', (t) => {
    const restore = stubDateNow(Date.UTC(2019, 10 - 1, 1));
    const activity = getUpdatedActivity({
        last28Days: '1000000000000000000000000000',
        lastUpdated: '2019-10-01T00:00:00.000Z'
    });

    t.is(activity, null);

    restore();
});

test('It does nothing when the activity history is for an earlier day', (t) => {
    const restore = stubDateNow(Date.UTC(2019, 10 - 1, 1));
    const activity = getUpdatedActivity({
        last28Days: '1000000000000000000000000000',
        lastUpdated: '2019-10-02T00:00:00.000Z'
    });

    t.is(activity, null);

    restore();
});
