import * as fs from 'fs';
import * as path from 'path';

import anyTest, { TestInterface } from 'ava';

import { createHTMLDocument, HTMLDocument } from '../../src/dom';

type HTMLContext = {
    document: HTMLDocument;
};

const test = anyTest as TestInterface<HTMLContext>;

const html = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'test-html.html'), 'utf-8'); // eslint-disable-line no-sync
const serializedHTML = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'serialized-test-html.html'), 'utf-8'); // eslint-disable-line no-sync

test.beforeEach((t) => {
    t.context.document = createHTMLDocument(html, 'http://example.com');
});

test('HTMLDocument.dom() should return the html node', (t) => {
    const dom = t.context.document.documentElement;

    t.is(dom.nodeName, 'html');
});

test('HTMLDocument.base should return the base url', (t) => {
    t.is(t.context.document.base, 'http://example.com/resources/');
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

    t.is(item.attributes.length, 2);
    t.is(item.attributes[0].name, 'id');
    t.is(item.attributes[0].value, '{expression}');
    t.is(item.attributes[1].name, 'class');
    t.is(item.attributes[1].value, 'title');
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

    t.is(location && location.line, 6);
    t.is(location && location.column, 9);
});

test('HTMLElement.isSame() should return if an item is the same or not', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.true(item.isSame(item));
});

test('HTMLElement.outerHTML should return the element HTML', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.is(item.outerHTML, '<h1 id="{expression}" class="title">Title</h1>');
});

test('HTMLElement.innerHTML should return the element content', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    t.is(item.innerHTML, 'Title');
});

test('HTMLElement.parentElement should return the parent element if it exists', (t) => {
    const item = t.context.document.querySelectorAll('.title')[0];

    const parentNodeName = item.parentElement && item.parentElement.nodeName;

    t.is(parentNodeName, 'body');
});

test('HTMLElement.parentElement should return `null` if parent doesn\'t exists (for root level elements)', (t) => {
    const dom = t.context.document.documentElement;

    t.is(dom.parentElement, null);
});


test('HTMLElement.children should return an array of child elements', (t) => {
    const dom = t.context.document;
    const body = dom.querySelectorAll('body')[0];
    const children = body.children;

    t.is(children.length, 2);
    t.is(children[0].innerHTML, 'Title');
});

test('HTMLElement.isAttributeAnExpression should report if an attribute value was interpolated', (t) => {
    const dom = t.context.document;
    const h1 = dom.querySelectorAll('h1')[0];

    t.false(h1.isAttributeAnExpression('class'));
    t.true(h1.isAttributeAnExpression('id'));
});

test('HTMLDocument.isFragment should report if a document was created from a template', (t) => {
    const dom1 = t.context.document;
    const dom2 = createHTMLDocument('<div>Test</div>', 'http://example.com');

    t.false(dom1.isFragment);
    t.true(dom2.isFragment);
});
