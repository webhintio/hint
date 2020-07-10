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
