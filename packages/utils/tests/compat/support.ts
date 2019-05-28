import test from 'ava';

import { getUnsupported, isSupported } from '../../src/compat';

test('isSupported works', (t) => {
    t.true(isSupported({ element: 'details' }, ['chrome 74']));
    t.false(isSupported({ element: 'details' }, ['ie 11']));
});

test('Element query works', (t) => {
    const unsupported = getUnsupported(
        { element: 'details' },
        ['chrome 74', 'ie 11']
    );

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 11');
});

test('Attribute query works', (t) => {
    const unsupported = getUnsupported(
        { attribute: 'hidden' },
        ['ie 10', 'ie 11']
    );

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 10');
});

test('Attribute value query works', (t) => {
    const unsupported = getUnsupported({
        attribute: 'rel',
        element: 'link',
        value: 'noopener'
    }, ['firefox 51', 'firefox 52']);

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'firefox 51');
});

test('Input type query works', (t) => {
    const unsupported = getUnsupported({
        attribute: 'type',
        element: 'input',
        value: 'color'
    }, ['ie 11', 'edge 14']);

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 11');
});

test('Property query works', (t) => {
    const unsupported = getUnsupported(
        { property: 'pointer-events' },
        ['ie 10', 'ie 11']
    );

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 10');
});

test('Prefixed property query works', (t) => {
    const unsupported = getUnsupported(
        { property: '-webkit-transform' },
        ['ie 10', 'ie 11']
    );

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 10');
});

test('Property value query works (full match)', (t) => {
    const unsupported = getUnsupported({
        property: 'display',
        value: 'grid'
    }, ['edge 15', 'edge 16']);

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'edge 15');
});

test('Prefixed property value query works (full match)', (t) => {
    const unsupported = getUnsupported({
        property: 'display',
        value: '-ms-grid'
    }, ['ie 9', 'ie 10']);

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 9');
});

test('Property value query works (keyword match)', (t) => {
    const unsupported = getUnsupported({
        property: '-ms-transform',
        value: 'rotate(180deg) translateZ(-100px)'
    }, ['ie 9', 'ie 10']);

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 9');
});

test('Property value query works (regex token match)', (t) => {
    const unsupported = getUnsupported({
        property: 'color',
        value: '#ff0000cc'
    }, ['chrome 61', 'chrome 62']);

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'chrome 61');
});

test('At-rule query works', (t) => {
    const unsupported = getUnsupported(
        { rule: 'supports' },
        ['edge 12', 'ie 11']
    );

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 11');
});

test('Selector query works', (t) => {
    const unsupported = getUnsupported(
        { selector: 'input:valid' },
        ['ie 9', 'ie 10']
    );

    t.is(unsupported && unsupported.length, 1);
    t.is(unsupported && unsupported[0], 'ie 9');
});
