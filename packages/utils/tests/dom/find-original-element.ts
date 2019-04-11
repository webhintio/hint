import test from 'ava';

import { createHTMLDocument, findOriginalElement } from '../../src/dom/';

const compare = (originalSource: string, snapshotSource: string) => {
    const originalDocument = createHTMLDocument(originalSource);
    const snapshotDocument = createHTMLDocument(snapshotSource);

    const originalElement = originalDocument.querySelectorAll('[data-original]')[0] || null;
    const snapshotElement = snapshotDocument.querySelectorAll('[data-snapshot]')[0];

    const foundElement = findOriginalElement(originalDocument, snapshotElement);

    const result = originalElement && foundElement ? originalElement.isSame(foundElement) : originalElement === foundElement;

    if (!result) {
        console.log(`Match:
            ${originalElement && originalElement.outerHTML}
            ${foundElement && foundElement.outerHTML}`);
    }

    return result;
};

test('Find by URL match (src)', (t) => {
    const result = compare(
        `
            <img data-original src="test2.png">
        `,
        `
            <img src="test1.png">
            <img data-snapshot src="test2.png">
            <img src="test3.png">
        `
    );

    t.true(result);
});

test('Find by URL no match (src)', (t) => {
    const result = compare(
        `
            <img src="test1.png">
        `,
        `
            <img src="test1.png">
            <img data-snapshot src="test2.png">
            <img src="test3.png">
        `
    );

    t.true(result);
});

test('Find by nth URL match (src)', (t) => {
    const result = compare(
        `
            <img src="test2.png">
            <img data-original src="test2.png">
        `,
        `
            <img src="test1.png">
            <img src="test2.png">
            <img data-snapshot src="test2.png">
            <img src="test3.png">
        `
    );

    t.true(result);
});

test('Find by URL match (href)', (t) => {
    const result = compare(
        `
            <link data-original src="test2.css">
        `,
        `
            <link src="test1.css">
            <link data-snapshot src="test2.css">
            <link src="test3.css">
        `
    );

    t.true(result);
});

test('Find by content match (script)', (t) => {
    const result = compare(
        `
            <script data-original>var foo2 = 'bar';</script>
        `,
        `
            <script>var foo1 = 'bar';</script>
            <script data-snapshot>var foo2 = 'bar';</script>
            <script>var foo3 = 'bar';</script>
        `
    );

    t.true(result);
});

test('Find by URL or content no match (script)', (t) => {
    const result = compare(
        `
            <script src="test2.js"></script>
        `,
        `
            <script data-snapshot src="test1.js"></script>
            <script src="test2.js"></script>
        `
    );

    t.true(result);
});

test('Find by nth content match (button)', (t) => {
    const result = compare(
        `
            <button>OK</button>
            <button data-original>OK</button>
        `,
        `
            <button>OK</button>
            <button>Cancel</button>
            <button data-snapshot>OK</button>
            <button>Cancel</button>
        `
    );

    t.true(result);
});

test('Find by first class match (div)', (t) => {
    const result = compare(
        `
            <div class="first">Test</div>
            <div class="second" data-original>Test</div>
            <div class="third">Test</div>
        `,
        `
            <div class="first">Test</div>
            <div class="third">Test</div>
            <div class="second active" data-snapshot>Test</div>
        `
    );

    t.true(result);
});

test('Find by first class no match (div)', (t) => {
    const result = compare(
        `
            <div class="first">Test</div>
        `,
        `
            <div class="first">Test</div>
            <div class="second" data-snapshot>Test</div>
        `
    );

    t.true(result);
});

test('Find by singleton match (html)', (t) => {
    const result = compare(
        `
            <html data-original>
                Test
            </html>
        `,
        `
            <html data-snapshot>
                <head>
                    <title></title>
                </head>
                <body>
                    Test
                </body>
            </html>
        `
    );

    t.true(result);
});

test('Find by nth match (tr)', (t) => {
    const result = compare(
        `
            <table>
                <tr><td>Data</td></tr>
                <tr data-original><td>Data</td></tr>
            </table>
        `,
        `
            <table>
                <tr><td>Data</td></tr>
                <tr data-snapshot><td>Data</td></tr>
            </table>
        `
    );

    t.true(result);
});

test('Find by nth no match (tr)', (t) => {
    const result = compare(
        `
            <table>
                <tr><td>Data</td></tr>
                <tr><td>Data</td></tr>
            </table>
        `,
        `
            <table>
                <tr><td>Data</td></tr>
                <tr><td>Data</td></tr>
                <tr data-snapshot><td>Data</td></tr>
            </table>
        `
    );

    t.true(result);
});
