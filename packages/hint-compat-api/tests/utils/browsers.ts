import test from 'ava';

import { joinBrowsers } from '../../src/utils/browsers';

test('disjoint', (t) => {
    t.deepEqual(
        joinBrowsers({
            browsers: ['chrome 74', 'chrome 76'],
            details: new Map([
                ['chrome 74', { versionAdded: '77' }],
                ['chrome 76', { versionAdded: '77' }]
            ])
        }),
        'Chrome < 77'
    );
});

test('range', (t) => {
    t.deepEqual(
        joinBrowsers({
            browsers: ['firefox 65', 'firefox 66', 'and_ff 66'],
            details: new Map([
                ['firefox 65', { versionAdded: '67' }],
                ['firefox 66', { versionAdded: '67' }],
                ['and_ff 66', { versionAdded: '67' }]
            ])
        }),
        'Firefox < 67, Firefox Android < 67'
    );
});

test('removed then re-added', (t) => {
    t.deepEqual(
        joinBrowsers({
            browsers: ['opera 16'],
            details: new Map([
                ['opera 16', { versionAdded: '30', versionRemoved: '15'}]
            ])
        }),
        'Opera 15-30'
    );
});

test('removed', (t) => {
    t.deepEqual(
        joinBrowsers({
            browsers: ['opera 15'],
            details: new Map([
                ['opera 15', { versionRemoved: '15' }]
            ])
        }),
        'Opera 15+'
    );
});
