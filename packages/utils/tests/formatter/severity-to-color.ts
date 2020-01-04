import test from 'ava';
import * as chalk from 'chalk';

import { Severity } from '@hint/utils-types';

import { severityToColor } from '../../src/formatter';

test('If severity is error, it should return red', (t) => {
    const result = severityToColor(Severity.error);
    const commonString = 'result';

    t.is(result(commonString), chalk.red(commonString));
});

test('If severity is warning, it should return yellow', (t) => {
    const result = severityToColor(Severity.warning);
    const commonString = 'result';

    t.is(result(commonString), chalk.yellow(commonString));
});

test('If severity is information, it should return gray', (t) => {
    const result = severityToColor(Severity.information);
    const commonString = 'result';

    t.is(result(commonString), chalk.gray(commonString));
});

test('If severity is hint, it should return a pinky color defined using an hex value', (t) => {
    const result = severityToColor(Severity.hint);
    const commonString = 'result';

    t.is(result(commonString), chalk.hex('9451A0')(commonString));
});
