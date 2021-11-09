import test from 'ava';

import { createHTMLDocument } from '../src';

test('childNodes', (t) => {
    const doc = createHTMLDocument('<body>1<div></div>2</body>', 'http://localhost/');

    t.is(doc.childNodes.length, 1);
    t.is(doc.body.childNodes.length, 3);
    t.is(doc.body.childNodes[1].childNodes.length, 0);
});

test('contains', (t) => {
    const doc = createHTMLDocument('<body>1<div></div>2</body>', 'http://localhost/');

    t.is(doc.contains(doc.body), true);
    t.is(doc.contains(doc.body.childNodes[1]), true);
    t.is(doc.body.contains(doc.body.childNodes[1]), true);
    t.is(doc.body.contains(doc.body), true);
    t.is(doc.body.childNodes[1].contains(doc.body), false);
    t.is(doc.body.childNodes[1].contains(doc.body.childNodes[0]), false);
});

test('nodeName', (t) => {
    const doc = createHTMLDocument('<!doctype html><!--comment--><html><body>text<script>test</script><style>test</style></body></html>', 'http://localhost/');

    t.is(doc.nodeName, '#document');
    t.is(doc.childNodes[0].nodeName, 'html');
    t.is(doc.childNodes[1].nodeName, '#comment');
    t.is(doc.body.nodeName, 'BODY');
    t.is(doc.body.childNodes[0].nodeName, '#text');
    t.is(doc.body.childNodes[1].nodeName, 'SCRIPT');
    t.is(doc.body.childNodes[2].nodeName, 'STYLE');
});

test('nodeType', (t) => {
    const doc = createHTMLDocument('<!doctype html><!--comment--><html><body>text</body></html>', 'http://localhost/');

    t.is(doc.nodeType, 9);
    t.is(doc.childNodes[0].nodeType, 10);
    t.is(doc.childNodes[1].nodeType, 8);
    t.is(doc.body.nodeType, 1);
    t.is(doc.body.childNodes[0].nodeType, 3);
});

test('nodeValue', (t) => {
    const doc = createHTMLDocument('<!doctype html><!--comment--><html><body>text</body></html>', 'http://localhost/');

    t.is(doc.nodeValue, null);
    t.is(doc.childNodes[0].nodeValue, null);
    t.is(doc.childNodes[1].nodeValue, 'comment');
    t.is(doc.body.nodeValue, null);
    t.is(doc.body.childNodes[0].nodeValue, 'text');
});

test('parentElement', (t) => {
    const doc = createHTMLDocument('<div></div>', 'http://localhost/');

    t.is(doc.documentElement.parentElement, null);
    t.is(doc.body.parentElement, doc.documentElement);
    t.is(doc.body.childNodes[0].parentElement, doc.body);
});

test('parentNode', (t) => {
    const doc = createHTMLDocument('<body>test</body>', 'http://localhost/');

    t.is(doc.parentNode, null);
    t.is(doc.documentElement.parentNode, doc);
    t.is(doc.body.parentNode, doc.documentElement);
    t.is(doc.body.childNodes[0].parentNode, doc.body);
});

test('textContent', (t) => {
    const doc = createHTMLDocument('<div>1<div>2</div>3</div>', 'http://localhost/');

    t.is(doc.documentElement.textContent, '123');
});
