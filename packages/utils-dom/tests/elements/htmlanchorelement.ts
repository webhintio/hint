import test from 'ava';

import { createHTMLDocument } from '../../src';
import { HTMLAnchorElement } from '../../src/elements/htmlanchorelement';

test('href', (t) => {
    const doc = createHTMLDocument(`
        <a href="test.html">1</a>
        <a href="https://webhint.io">2</a>
        <a href="../test/bar.html">3</a>
    `, 'http://localhost/foo/bar.html');

    const anchors = doc.querySelectorAll('a') as HTMLAnchorElement[];

    t.is(anchors[0].href, 'http://localhost/foo/test.html');
    t.is(anchors[1].href, 'https://webhint.io/');
    t.is(anchors[2].href, 'http://localhost/test/bar.html');
});

test('URL parts', (t) => {
    const doc = createHTMLDocument('<a href="test.html?foo=bar#now">test</a>', 'http://localhost:8080/');
    const anchor = doc.body.children[0] as HTMLAnchorElement;

    t.is(anchor.protocol, 'http:');
    t.is(anchor.host, 'localhost:8080');
    t.is(anchor.search, '?foo=bar');
    t.is(anchor.hash, '#now');
    t.is(anchor.hostname, 'localhost');
    t.is(anchor.port, '8080');
    t.is(anchor.pathname, '/test.html');
});
