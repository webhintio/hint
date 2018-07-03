import test from 'ava';

import isHTMLDocument from '../../../../src/lib/utils/network/is-html-document';

test('isHTMLDocument retursn blindly true if protocol is "file:"', (t) => {
    const url = 'file://index.html';

    t.true(isHTMLDocument(url, {}), `isHTMLDocument doesn't return true if URL protocol is "file:"`);
});

test('isHTMLDocument guesses if response is HTML based on the media type', (t) => {
    const url = 'https://someresource.com/index.html';
    const htmlResponse = { 'content-type': 'text/html' };
    const noHtmlResponse = { 'content-type': 'text/javascript' };
    const invalidContentType = { 'content-type': 'asdasdasda' };

    t.true(isHTMLDocument(url, htmlResponse), `isHTMLDocument doesn't recognize HTML if header is text/html`);
    t.false(isHTMLDocument(url, noHtmlResponse), `isHTMLDocument doesn't recognize is not HTML if header is text/javascript`);
    t.false(isHTMLDocument(url, invalidContentType), `isHTMLDocument doesn't recognize invalid content types are not HTML`);
});
