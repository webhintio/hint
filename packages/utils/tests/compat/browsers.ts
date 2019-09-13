import test from 'ava';
import { Identifier } from 'mdn-browser-compat-data/types';

import { getUnsupportedBrowsers } from '../../src/compat/browsers';

test('Handles complex support', (t) => {
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

    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 12'])!.browsers, ['opera 12'], 'Before first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 12.1']), null, 'At first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 13']), null, 'During first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 15'])!.browsers, ['opera 15'], 'After first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 29'])!.browsers, ['opera 29'], 'Before second unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 30']), null, 'At second unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 31']), null, 'After second unprefixed support');

    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 11'])!.browsers, ['opera 11'], 'Before -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 12']), null, 'At -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 12']), null, 'During -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 15'])!.browsers, ['opera 15'], 'After -o- support');

    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 14'])!.browsers, ['opera 14'], 'Before -webkit- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 15']), null, 'At -webkit- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 16']), null, 'During -webkit- support');
});

test('Handles supported prefix', (t) => {
    /* eslint-disable */
    const maxContent: Identifier = {
        __compat: {
            support: {
                firefox: [
                    { version_added: "66" },
                    {
                        prefix: "-moz-",
                        version_added: "41",
                    }
                ]
            }
        }
    } as any;
    /* eslint-enable */

    t.deepEqual(getUnsupportedBrowsers(maxContent, '', ['firefox 66']), null);
    t.deepEqual(getUnsupportedBrowsers(maxContent, '', ['firefox 65'])!.browsers, ['firefox 65']);
    t.deepEqual(getUnsupportedBrowsers(maxContent, '', ['firefox 41'])!.browsers, ['firefox 41']);
    t.deepEqual(getUnsupportedBrowsers(maxContent, '', ['firefox 40'])!.browsers, ['firefox 40']);

    t.deepEqual(getUnsupportedBrowsers(maxContent, '-moz-', ['firefox 66']), null);
    t.deepEqual(getUnsupportedBrowsers(maxContent, '-moz-', ['firefox 65']), null);
    t.deepEqual(getUnsupportedBrowsers(maxContent, '-moz-', ['firefox 41']), null);
    t.deepEqual(getUnsupportedBrowsers(maxContent, '-moz-', ['firefox 40'])!.browsers, ['firefox 40']);
});

test('Handles unsupported prefix', (t) => {
    /* eslint-disable */
    const appearance: Identifier = {
        __compat: {
            support: {
                firefox: {
                    prefix: "-moz-",
                    version_added: "1"
                },
            }
        }
    } as any;
    /* eslint-enable */

    t.deepEqual(getUnsupportedBrowsers(appearance, '', ['firefox 1'])!.browsers, ['firefox 1']);
    t.deepEqual(getUnsupportedBrowsers(appearance, '-webkit-', ['firefox 1'])!.browsers, ['firefox 1']);
    t.deepEqual(getUnsupportedBrowsers(appearance, '-moz-', ['firefox 1']), null);
});

test('Handles multiple supported prefixes', (t) => {
    /* eslint-disable */
    const boxFlex: Identifier = {
        __compat: {
            support: {
                firefox: [
                    {
                        prefix: "-moz-",
                        version_added: true
                    },
                    {
                        prefix: "-webkit-",
                        version_added: "49"
                    }
                ],
            }
        }
    } as any;
    /* eslint-enable*/

    t.deepEqual(getUnsupportedBrowsers(boxFlex, '', ['firefox 48'])!.browsers, ['firefox 48']);
    t.deepEqual(getUnsupportedBrowsers(boxFlex, '-moz-', ['firefox 48']), null);
    t.deepEqual(getUnsupportedBrowsers(boxFlex, '-webkit-', ['firefox 48'])!.browsers, ['firefox 48']);

    t.deepEqual(getUnsupportedBrowsers(boxFlex, '', ['firefox 49'])!.browsers, ['firefox 49']);
    t.deepEqual(getUnsupportedBrowsers(boxFlex, '-moz-', ['firefox 49']), null);
    t.deepEqual(getUnsupportedBrowsers(boxFlex, '-webkit-', ['firefox 49']), null);
});

test('Handles removed features', (t) => {
    /* eslint-disable */
    const boxLines: Identifier = {
        __compat: {
            support: {
                chrome: {
                    version_added: true,
                    version_removed: "67",
                    prefix: "-webkit-"
                },
            }
        }
    } as any;
    /* eslint-enable */

    t.deepEqual(getUnsupportedBrowsers(boxLines, '-webkit-', ['chrome 66']), null);
    t.deepEqual(getUnsupportedBrowsers(boxLines, '-webkit-', ['chrome 67'])!.browsers, ['chrome 67']);
    t.deepEqual(getUnsupportedBrowsers(boxLines, '-webkit-', ['chrome 66', 'chrome 67'])!.browsers, ['chrome 67']);
});

test('Includes accurate details', (t) => {
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

    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 12'])!.details.get('opera 12'), { versionAdded: '12.1' }, 'Before first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 15'])!.details.get('opera 15'), { versionAdded: '30', versionRemoved: '15' }, 'After first unprefixed support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '', ['opera 29'])!.details.get('opera 29'), { versionAdded: '30', versionRemoved: '15' }, 'Before second unprefixed support');

    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 11'])!.details.get('opera 11'), { versionAdded: '12' }, 'Before -o- support');
    t.deepEqual(getUnsupportedBrowsers(keyframes, '-o-', ['opera 15'])!.details.get('opera 15'), { versionRemoved: '15' }, 'After -o- support');

    t.deepEqual(getUnsupportedBrowsers(keyframes, '-webkit-', ['opera 14'])!.details.get('opera 14'), { versionAdded: '15' }, 'Before -webkit- support');
});
