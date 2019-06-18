import test from 'ava';

import { createHTMLDocument, getElementByUrl } from '../../src/dom/';

test('Find by URL match (no match)', (t) => {
    const dom = createHTMLDocument(`
        <img src="test1.png">
    `, 'http://example.com/index.html');

    const element = getElementByUrl(dom, 'http://example.com/test2.png');

    t.is(element, null);
});

test('Find by URL match (no match, different origin)', (t) => {
    const dom = createHTMLDocument(`
        <img src="test.png">
    `, 'http://example.com/index.html');

    const element = getElementByUrl(dom, 'http://example2.com/test.png');

    t.is(element, null);
});

test('Find by URL match (relative src)', (t) => {
    const url = 'test.png';
    const dom = createHTMLDocument(`
        <img src="${url}">
    `, 'http://example.com/index.html');

    const element = getElementByUrl(dom, `http://example.com/${url}`);

    t.not(element, null);
    t.is(element!.getAttribute('src'), url);
});

test('Find by URL match (relative subdirectory src)', (t) => {
    const url = '../images/test.png';
    const dom = createHTMLDocument(`
        <img src="${url}">
    `, 'http://example.com/pages/test.html');

    const element = getElementByUrl(dom, 'http://example.com/images/test.png');

    t.not(element, null);
    t.is(element!.getAttribute('src'), url);
});

test('Find by URL match (root relative subdirectory src)', (t) => {
    const url = '/images/test.png';
    const dom = createHTMLDocument(`
        <img src="${url}">
    `, 'http://example.com/pages/test.html');

    const element = getElementByUrl(dom, `http://example.com${url}`);

    t.not(element, null);
    t.is(element!.getAttribute('src'), url);
});

test('Find by URL match (absolute src)', (t) => {
    const url = 'http://example2.com/images/test.png';
    const dom = createHTMLDocument(`
        <img src="${url}">
    `, 'http://example.com/index.html');

    const element = getElementByUrl(dom, url);

    t.not(element, null);
    t.is(element!.getAttribute('src'), url);
});

test('Find by URL match (data-uri src)', (t) => {
    // Red dot example data-uri from https://en.wikipedia.org/wiki/Data_URI_scheme
    const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const dom = createHTMLDocument(`
        <img src="test.png">
        <img src="${url}">
    `, 'http://example.com/index.html');

    const element = getElementByUrl(dom, url);

    t.not(element, null);
    t.is(element!.getAttribute('src'), url);
});
