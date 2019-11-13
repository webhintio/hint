import test from 'ava';
import * as chalk from 'chalk';

import { Severity } from '@hint/utils-types';

import { occurencesToColor } from '../../src/formatter';

test('If there is any error, it should return red', (t) => {
    const result = occurencesToColor({
        [Severity.error.toString()]: 1,
        [Severity.warning.toString()]: 1,
        [Severity.information.toString()]: 1,
        [Severity.hint.toString()]: 1
    });
    const commonString = 'result';

    t.is(result(commonString), chalk.red(commonString));
});

test('If there is any warning and no errors, it should return yellow', (t) => {
    const result = occurencesToColor({
        [Severity.error.toString()]: 0,
        [Severity.warning.toString()]: 1,
        [Severity.information.toString()]: 1,
        [Severity.hint.toString()]: 1
    });
    const commonString = 'result';

    t.is(result(commonString), chalk.yellow(commonString));
});

test('If there is any information and no errors neither warnings, it should return gray', (t) => {
    const result = occurencesToColor({
        [Severity.error.toString()]: 0,
        [Severity.warning.toString()]: 0,
        [Severity.information.toString()]: 1,
        [Severity.hint.toString()]: 1
    });
    const commonString = 'result';

    t.is(result(commonString), chalk.gray(commonString));
});

test('If there is only hints, it should return a pinky color defined using an hex value', (t) => {
    const result = occurencesToColor({
        [Severity.error.toString()]: 0,
        [Severity.warning.toString()]: 0,
        [Severity.information.toString()]: 0,
        [Severity.hint.toString()]: 1
    });
    const commonString = 'result';

    t.is(result(commonString), chalk.hex('9451A0')(commonString));
});
