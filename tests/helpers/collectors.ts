import cdpBuilder from '../../src/lib/collectors/cdp/cdp';
import jsdomBuilder from '../../src/lib/collectors/jsdom/jsdom';

/** The ids of the available collectors to test. */
export const ids = ['cdp'];

/** The builders of the available collectors to test. */
export const builders = [
    {
        builder: cdpBuilder,
        name: 'cdp'
    },
    {
        builder: jsdomBuilder,
        name: 'jsdom'
    }
];
