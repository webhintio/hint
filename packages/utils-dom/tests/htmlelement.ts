import test from 'ava';

import { createHTMLDocument } from '../src';

test('id', (t) => {
    const doc = createHTMLDocument('<div></div><div id="test"></div>', 'http://localhost/');

    t.is(doc.body.id, '');
    t.is(doc.body.children[0].id, '');
    t.is(doc.body.children[1].id, 'test');
});

test('name', (t) => {
    const doc = createHTMLDocument('<input/><input name="test"/>', 'http://localhost/');

    t.is(doc.body.name, '');
    t.is(doc.body.children[0].name, '');
    t.is(doc.body.children[1].name, 'test');
});

test('style', (t) => {
    const doc = createHTMLDocument('<body style="color: #000"></body>', 'http://localhost/');

    t.truthy(doc.body.style.getPropertyValue);
    // TODO: t.is(doc.body.style.getPropertyValue('color', '#000'));
});

test('type', (t) => {
    const doc = createHTMLDocument(`
        <body>
            <input>
            <input type="checkbox">
            <input type="radio">
            <button>
            <button type="button">
        </body>
    `, 'http://localhost/');

    t.is(doc.body.type, '');
    t.is(doc.body.children[0].type, 'text');
    t.is(doc.body.children[1].type, 'checkbox');
    t.is(doc.body.children[2].type, 'radio');
    t.is(doc.body.children[3].type, 'submit');
    t.is(doc.body.children[4].type, 'button');
});

test('getAttribute', (t) => {
    const doc = createHTMLDocument('<div id="foo">test</div>', 'http://localhost/');

    t.is(doc.body.children[0].getAttribute('id'), 'foo');
    t.is(doc.body.children[0].getAttribute('class'), null);
});

test('hasAttribute', (t) => {
    const doc = createHTMLDocument('<div id="foo">test</div>', 'http://localhost/');

    t.true(doc.body.children[0].hasAttribute('id'));
    t.false(doc.body.children[0].hasAttribute('class'));
});

test('hasAttributes', (t) => {
    const doc = createHTMLDocument('<div id="foo">test</div>', 'http://localhost/');

    t.true(doc.body.children[0].hasAttributes());
    t.false(doc.body.hasAttributes());
});

test('isAttributeAnExpression', (t) => {
    const doc = createHTMLDocument('<div id={id} class="foo">{value}</div>', 'http://localhost/');

    t.true(doc.body.children[0].isAttributeAnExpression('id'));
    t.false(doc.body.children[0].isAttributeAnExpression('class'));
});
