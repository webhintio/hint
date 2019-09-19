import test from 'ava';

import { formatSupported, joinBrowsers } from '../../src/utils/browsers';

test('support added', (t) => {
    t.is(formatSupported('chrome 74', '77'), 'Chrome 77+');
});

test('support removed', (t) => {
    t.is(formatSupported('opera 16', undefined, '15'), 'Opera < 15');
});

test('support added then removed', (t) => {
    t.is(formatSupported('opera 12', '12', '15'), 'Opera 12-15');
});

test('disjoint', (t) => {
    t.is(
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
    t.is(
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
    t.is(
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
    t.is(
        joinBrowsers({
            browsers: ['opera 15'],
            details: new Map([
                ['opera 15', { versionRemoved: '15' }]
            ])
        }),
        'Opera 15+'
    );
});
