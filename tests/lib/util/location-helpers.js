/* eslint sort-keys: 0 */
import test from 'ava';
import jsdom from 'jsdom';
import pify from 'pify';

import { readFile } from '../../../dist/lib/util/misc';
const getPage = pify(jsdom.env);

import { findInElement, findProblemLocation, findElementLocation } from '../../../dist/lib/util/location-helpers';


// ------------------------------------------------------------------------------
// findInElement tests
// ------------------------------------------------------------------------------

/** Returns an object that simulates an HTMLElement */
const getElement = (markup) => {
    return {
        get outerHTML() {
            return markup;
        }
    };
};

/** AVA Macro for findInElement */
const findInElementMacro = async (t, info, expectedPosition) => {
    const element = getElement(info.markup);
    const position = findInElement(element, info.content);

    t.deepEqual(position, expectedPosition);
};

const findInElementEntries = [
    {
        name: 'missing content',
        markup: `<a href="https://www.wikipedia.org">wikipedia</a>`,
        position: {
            line: 0,
            column: 0
        }
    },
    {
        name: 'with content',
        markup: `<a href="https://www.wikipedia.org">wikipedia</a>`,
        content: 'https://',
        position: {
            line: 1,
            column: 9
        }
    },
    {
        name: 'invalid content',
        markup: `<a href="https://www.wikipedia.org">wikipedia</a>`,
        content: 'http://',
        position: {
            line: -1,
            column: -1
        }
    }
];

findInElementEntries.forEach((entry) => {
    test(`findInElement - ${entry.name}`, findInElementMacro, entry, entry.position);
});


// ------------------------------------------------------------------------------
// findElementLocation tests
// ------------------------------------------------------------------------------

const loadHtmlAsWindow = async (path) => {
    const html = readFile(path);
    const window = await getPage(html);

    return window;
};


const findElementLocationEntries = [
    {
        name: 'existing element',
        selector: `a[href="https://www.wikipedia.org"]`,
        index: 0,
        position: {
            line: 6,
            column: 4
        }
    },
    {
        name: 'duplicate element, same line',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 1,
        position: {
            line: 9,
            column: 57
        }
    },
    {
        name: 'duplicate element, different line',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 2,
        position: {
            line: 12,
            column: 8
        }
    },
    {
        name: 'similar element, different line (innerHTML different)',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 3,
        position: {
            line: 17,
            column: 4
        }
    }
];

test('findElementLocation tests', async (t) => {
    const window = await loadHtmlAsWindow('./tests/fixtures/util/location-helpers/test-page.html');

    findElementLocationEntries.forEach((entry) => {
        const element = window.document.querySelectorAll(entry.selector)[entry.index];
        const position = findElementLocation(element);

        t.deepEqual(position, entry.position, `findElementLocation - ${entry.name}`);
    });
});


// ------------------------------------------------------------------------------
// findProblemLocation tests
// ------------------------------------------------------------------------------

const findProblemLocationEntries = [
    {
        name: 'element without content',
        selector: `a[href="https://www.wikipedia.org"]`,
        index: 0,
        position: {
            line: 6,
            column: 4
        },
        offset: {
            line: 0,
            column: 0
        }
    },
    {
        name: 'element with content',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 3,
        content: 'similar',
        position: {
            line: 19,
            column: 4
        },
        offset: {
            line: 1,
            column: 0
        }
    }
];

test('findProblemLocation tests', async (t) => {
    const window = await loadHtmlAsWindow('./tests/fixtures/util/location-helpers/test-page.html');

    findProblemLocationEntries.forEach((entry) => {
        const element = window.document.querySelectorAll(entry.selector)[entry.index];
        const position = findProblemLocation(element, entry.offset, entry.content);

        t.deepEqual(position, entry.position, `findElementLocation - ${entry.name}`);
    });
});
