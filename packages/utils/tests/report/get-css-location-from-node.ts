import test from 'ava';
import { ChildNode } from 'postcss';

import { getCSSLocationFromNode } from '../../src/report/get-css-location-from-node';

test(`If node doesn't have any location info, it should return undefined`, (t) => {
    const result = getCSSLocationFromNode({ source: {} } as ChildNode);

    t.is(result, undefined);
});

test(`If node type is 'atrule' it should return the same start and end position`, (t) => {
    const result = getCSSLocationFromNode({
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'atrule'
    } as ChildNode)!;

    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 0);
    t.is(result.endLine, 4);
});

test(`If node type is 'rule' it should return the same start and end position`, (t) => {
    const result = getCSSLocationFromNode({
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'rule'
    } as ChildNode)!;

    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 0);
    t.is(result.endLine, 4);
});

test(`If node type is 'comment' it should return the same start and end position`, (t) => {
    const result = getCSSLocationFromNode({
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'comment'
    } as ChildNode)!;

    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 0);
    t.is(result.endLine, 4);
});

test(`If node type is decl and the second parameter is not present, it should return the position of the property`, (t) => {
    const result = getCSSLocationFromNode({
        prop: 'display',
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'decl'
    } as ChildNode)!;

    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 7);
    t.is(result.endLine, 4);
});

test(`If node type is decl and between is in one single line, it should return the position of the property value`, (t) => {
    /*
     * display: -ms-grid;
     *          ^       ^
     */
    const result = getCSSLocationFromNode({
        prop: 'display',
        raws: { between: ': ' },
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'decl',
        value: '-ms-grid'
    } as ChildNode, { isValue: true })!;

    t.is(result.column, 9);
    t.is(result.line, 4);
    t.is(result.endColumn, 17);
    t.is(result.endLine, 4);
});

test(`If node type is decl and between the property and the value there is multiple lines, it should return the position of the property value`, (t) => {
    /*
     * display:
     *    /* this is a comment *\/ -ms-grid; * using \/ to not break the multi line comment
     *                             ^       ^
     */
    const result = getCSSLocationFromNode({
        prop: 'display',
        raws: { between: ':\n   /* this is a comment */ ' },
        source: {
            start: {
                column: 1,
                line: 5
            }
        },
        type: 'decl',
        value: '-ms-grid'
    } as ChildNode, { isValue: true })!;

    t.is(result.column, 27);
    t.is(result.line, 5);
    t.is(result.endColumn, 35);
    t.is(result.endLine, 5);
});
