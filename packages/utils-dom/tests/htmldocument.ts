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
