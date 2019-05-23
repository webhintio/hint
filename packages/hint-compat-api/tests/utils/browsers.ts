import test from 'ava';

import { joinBrowsers } from '../../src/utils/browsers';

test('disjoint', (t) => {
    t.deepEqual(
        joinBrowsers(['chrome 74', 'chrome 76']),
        'chrome 74, 76'
    );
});

test('range', (t) => {
    t.deepEqual(
        joinBrowsers(['firefox 65', 'firefox 66', 'firefox 67']),
        'firefox 65-67'
    );
});

test('disjoint + range', (t) => {
    t.deepEqual(
        joinBrowsers(['chrome 73', 'chrome 75', 'chrome 76', 'chrome 78']),
        'chrome 73, 75-76, 78'
    );
});

test('multiple browsers', (t) => {
    t.deepEqual(
        joinBrowsers(['chrome 74', 'chrome 75', 'edge 15', 'edge 16']),
        'chrome 74-75, edge 15-16'
    );
});
