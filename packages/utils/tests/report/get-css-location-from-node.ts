import test from 'ava';
import { ChildNode } from 'postcss';

import { getLocationFromNode } from '../../src/report/get-css-location-from-node';

test(`If node doesn't have any location info, it should return undefined`, (t) => {
    const result = getLocationFromNode({ source: {} } as ChildNode);

    t.is(result, undefined);
});

test(`If node doesn't have 'end' property, it should return only column and line`, (t) => {
    const result = getLocationFromNode({
        source: {
            start: {
                column: 1,
                line: 5
            }
        }
    } as ChildNode)!;

    t.is(result.column, 0);
    t.is(result.line, 4);
});

test(`If node have 'end' property, it should return only column, line, endLine and endColumn`, (t) => {
    const result = getLocationFromNode({
        source: {
            end: {
                column: 8,
                line: 9
            },
            start: {
                column: 1,
                line: 5
            }
        }
    } as ChildNode)!;

    t.is(result.column, 0);
    t.is(result.line, 4);
    t.is(result.endColumn, 8);
    t.is(result.endLine, 9);
});
