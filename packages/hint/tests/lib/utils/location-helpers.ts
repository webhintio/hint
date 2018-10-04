/* eslint sort-keys: 0 */
import * as path from 'path';

import test from 'ava';
import { Context, GenericTestContext, Macros } from 'ava';
import { JSDOM } from 'jsdom';

import readFileAsync from '../../../src/lib/utils/fs/read-file-async';

import { IAsyncHTMLElement } from '../../../src/lib/types';
import { findInElement, findProblemLocation, findElementLocation } from '../../../src/lib/utils/location-helpers';
import { JSDOMAsyncHTMLElement } from '../../../src/lib/types/jsdom-async-html';

/*
 * ------------------------------------------------------------------------------
 * findInElement tests
 * ------------------------------------------------------------------------------
 */

/** Returns an object that simulates an AsyncHTMLElement */
const getElement = (markup: string): IAsyncHTMLElement => {
    // We don't specify the return value because ownerDocument isn't implemented here (nor needed)
    return {
        get nodeName() {
            return '';
        },
        outerHTML() {
            return Promise.resolve(markup);
        },
        get ownerDocument() {
            return null as any;
        },
        get attributes() {
            return [] as any;
        },
        getAttribute(name) {
            return name;
        },
        getLocation() {
            return null;
        },
        isSame(element) {//eslint-disable-line
            return false;
        }
    };
};

/** AVA Macro for findInElement */
const findInElementMacro: Macros<GenericTestContext<Context<any>>> = async (t, info, expectedPosition) => {
    const element = getElement(info.markup);
    const position = await findInElement(element, info.content);

    t.deepEqual(position, expectedPosition);
};

const findInElementEntries = [
    {
        name: 'missing content',
        markup: `<a href="https://www.wikipedia.org">wikipedia</a>`,
        position: {
            line: 1,
            column: 0
        }
    },
    {
        name: 'with content',
        markup: `<a href="https://www.wikipedia.org">wikipedia</a>`,
        content: 'https://',
        position: {
            line: 1,
            column: 10
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


/*
 * ------------------------------------------------------------------------------
 * findElementLocation tests
 * ------------------------------------------------------------------------------
 */

const loadHTML = async (route: string) => {
    const html: string = await readFileAsync(path.resolve(__dirname, route));
    const doc: HTMLDocument = new JSDOM(html).window.document;

    const querySelectorAll = (function (document) {
        return (selector: string) => {
            const elements = Array.from(document.querySelectorAll(selector))
                .map((entry) => {
                    return new JSDOMAsyncHTMLElement(entry as HTMLElement);
                });

            return Promise.resolve(elements);
        };
    }(doc));

    return querySelectorAll;
};


const findElementLocationEntries = [
    {
        name: 'existing element',
        selector: `a[href="https://www.wikipedia.org"]`,
        index: 0,
        position: {
            line: 6,
            column: 5
        }
    },
    {
        name: 'duplicate element, same line',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 1,
        position: {
            line: 9,
            column: 58
        }
    },
    {
        name: 'duplicate element, different line',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 2,
        position: {
            line: 12,
            column: 9
        }
    },
    {
        name: 'similar element, different line (innerHTML different)',
        selector: `a[href="https://www.duplicate.org"]`,
        index: 3,
        position: {
            line: 17,
            column: 5
        }
    }
];

test('findElementLocation tests', async (t) => {
    const querySelectorAll = await loadHTML('./fixtures/test-page.html');

    for (const entry of findElementLocationEntries) {
        const element = (await querySelectorAll(entry.selector))[entry.index];
        const position = await findElementLocation(element);

        t.deepEqual(position, entry.position, `findElementLocation - ${entry.name}`);
    }
});


/*
 * ------------------------------------------------------------------------------
 * findProblemLocation tests
 * ------------------------------------------------------------------------------
 */

const findProblemLocationEntries = [
    {
        name: 'element without content',
        selector: `a[href="https://www.wikipedia.org"]`,
        index: 0,
        position: {
            elementColumn: 0,
            elementLine: 1,
            line: 6,
            column: 5
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
            elementColumn: 5,
            elementLine: 3,
            line: 20,
            column: 5
        },
        offset: {
            line: 1,
            column: 0
        }
    }
];

test('findProblemLocation tests', async (t) => {
    const querySelectorAll = await loadHTML('./fixtures/test-page.html');

    for (const entry of findProblemLocationEntries) {
        const element = (await querySelectorAll(entry.selector))[entry.index];
        const position = await findProblemLocation(element, entry.offset, entry.content);

        t.deepEqual(position, entry.position, `findElementLocation - ${entry.name}`);
    }
});
