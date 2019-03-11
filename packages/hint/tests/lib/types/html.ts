import * as fs from 'fs';
import * as path from 'path';

import anyTest, { TestInterface } from 'ava';

import createHtmlDocument from '../../../src/lib/utils/dom/create-html-document';
import { HTMLDocument } from '../../../src/lib/types';

type HTMLContext = {
    document: HTMLDocument;
};

const test = anyTest as TestInterface<HTMLContext>;

const html = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'test-html.html'), 'utf-8'); // eslint-disable-line no-sync
const serializedHTML = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'serialized-test-html.html'), 'utf-8'); // eslint-disable-line no-sync

test.beforeEach((t) => {
    t.context.document = createHtmlDocument(html);
});

test('HTMLDocument.dom() should return the html node', (t) => {
    const dom = t.context.document.documentElement;

    t.is(dom.nodeName, 'html');
});

test('HTMLDocument.pageHTML() should return the html code', (t) => {
    const code = t.context.document.pageHTML();

    t.is(code.replace(/\r/g, ''), serializedHTML.replace(/\r/g, ''));
});

test('HTMLDocument.querySelectorAll should return an empty array if no item match the query', (t) => {
    const items = t.context.document.querySelectorAll('img');

    t.true(Array.isArray(items));
    t.is(items.length, 0);
});

test('HTMLDocument.querySelectorAll should return the right element', (t) => {
    const items = t.context.document.querySelectorAll('.title');

    t.is(items.length, 1);
    t.is(items[0].getAttribute('class'), 'title');
});

test('HTMLElement.attributes should return an array with all the attributes', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.is(item.attributes.length, 1);
    t.is(item.attributes[0].name, 'class');
    t.is(item.attributes[0].value, 'title');
});

test('HTMLElement.nodeName should return the node name', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.is(item.nodeName, 'h1');
});

test('HTMLElement.getAttribute() should return the attribute value', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.is(item.getAttribute('class'), 'title');
});

test('HTMLElement.getLocation() should return the element location', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];
    const location = item.getLocation();

    t.is(location && location.line, 3);
    t.is(location && location.column, 9);
});

test('HTMLElement.isSame() should return if an item is the same or not', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.true(item.isSame(item));
});

test('HTMLElement.outerHTML() should return the element HTML', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.is(item.outerHTML(), '<h1 class="title">Title</h1>');
});
