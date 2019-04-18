import test from 'ava';
import { Identifier } from 'mdn-browser-compat-data/types';

import { getUnsupportedBrowsers } from '../../src/compat/browsers';

/* eslint-disable */
const keyframes: Identifier = {
    __compat: {
        support: {
            opera: [
                {
                    version_added: "30"
                },
                {
                    prefix: "-webkit-",
                    version_added: "15"
                },
                {
                    version_added: "12.1",
                    version_removed: "15"
                },
                {
                    prefix: "-o-",
                    version_added: "12",
                    version_removed: "15"
                }
            ]
        }
    }
} as any;
/* eslint-enable */

test('Handles complex support', (t) => {
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 12']), ['opera 12'], 'Before first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 12.1']), null, 'At first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 13']), null, 'During first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 15']), ['opera 15'], 'After first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 29']), ['opera 29'], 'Before second unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 30']), null, 'At second unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 31']), null, 'After second unprefixed support');

    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 11']), ['opera 11'], 'Before -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 12']), null, 'At -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 12']), null, 'During -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 15']), ['opera 15'], 'After -o- support');

    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 14']), ['opera 14'], 'Before -webkit- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 15']), null, 'At -webkit- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 16']), null, 'During -webkit- support');
});
