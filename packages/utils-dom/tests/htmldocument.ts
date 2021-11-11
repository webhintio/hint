import test from 'ava';

import { createHTMLDocument } from '../src';

test('title', (t) => {
    const doc1 = createHTMLDocument('test', 'http://localhost/');
    const doc2 = createHTMLDocument('<title></title>', 'http://localhost/');
    const doc3 = createHTMLDocument('<title>test</title>', 'http://localhost/');

    t.is(doc1.title, '');
    t.is(doc2.title, '');
    t.is(doc3.title, 'test');
});

test('isFragment', (t) => {
    const doc1 = createHTMLDocument('<p>test</p>', 'http://localhost/');
    const doc2 = createHTMLDocument('<html>test</html>', 'http://localhost/');
    const doc3 = createHTMLDocument('<!doctype html>test', 'http://localhost/');

    t.true(doc1.isFragment);
    t.false(doc2.isFragment);
    t.false(doc3.isFragment);
});

test('querySelectorAll', (t) => {
    const doc = createHTMLDocument('<div id="d1">div1</div><div id="d2">div2</div>', 'http://localhost/');

    t.is(doc.querySelectorAll('div').length, 2);
    t.is(doc.querySelectorAll('#d1').length, 1);
    t.is(doc.querySelectorAll('#d2').length, 1);
    t.is(doc.querySelectorAll('#d1')[0].textContent, 'div1');
    t.is(doc.querySelectorAll('#d2')[0].textContent, 'div2');
    t.is(doc.querySelectorAll('div')[0], doc.querySelectorAll('#d1')[0]);
    t.is(doc.querySelectorAll('div')[1], doc.querySelectorAll('#d2')[0]);
});

test('querySelector', (t) => {
    const doc = createHTMLDocument('<div>div1</div>', 'http://localhost/');

    t.is(doc.querySelector('div')?.textContent, 'div1');
    t.is(doc.querySelector('not-div'), null);
});

test('do not create required parents in full documents', (t) => {
    const doc = createHTMLDocument('<html><li>item</li></html>', 'http://localhost/');

    t.is(doc.querySelector('li')?.parentElement?.nodeName, 'BODY');
});

test('create required parents in fragments', (t) => {
    const doc = createHTMLDocument('<li>item</li>', 'http://localhost/');

    t.is(doc.querySelector('li')?.parentElement?.nodeName, 'UL');
});

test('merge common required parents in fragments', (t) => {
    const doc = createHTMLDocument('<dt>term</dt><dd>def</dd>', 'http://localhost/');

    t.is(doc.querySelector('dt')?.parentElement?.nodeName, 'DL');
    t.is(doc.querySelector('dt')?.parentElement, doc.querySelector('dd')?.parentElement);
});

test('recursively create required parents in fragments', (t) => {
    const doc = createHTMLDocument('<td>item</td>', 'http://localhost/');

    t.is(doc.querySelector('td')?.parentElement?.nodeName, 'TR');
    t.is(doc.querySelector('tr')?.parentElement?.nodeName, 'TABLE');
});
