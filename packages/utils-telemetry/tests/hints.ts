import test from 'ava';

import { determineHintStatus, HintStatus } from '../src/hints';

test('It marks failed hints as failed', (t) => {
    const prev = {};
    const next = { 'compat-api/css': 1, 'compat-api/html': 1 };
    const status = determineHintStatus(prev, next);

    t.is(status['hint-compat-api/css'], HintStatus.failed);
    t.is(status['hint-compat-api/html'], HintStatus.failed);
});

test('It marks passed hints as passed with no history', (t) => {
    const prev = {};
    const next = { 'compat-api/css': 0, 'compat-api/html': 0 };
    const status = determineHintStatus(prev, next);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.passed);
});

test('It marks passed hints as fixed with failed history', (t) => {
    const prev = { 'compat-api/css': 0, 'compat-api/html': 1 };
    const next = { 'compat-api/css': 0, 'compat-api/html': 0 };
    const status = determineHintStatus(prev, next);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.fixed);
});

test('It marks failed hints as fixing with improvement vs history', (t) => {
    const prev = { 'compat-api/css': 0, 'compat-api/html': 3 };
    const next = { 'compat-api/css': 0, 'compat-api/html': 2 };
    const status = determineHintStatus(prev, next);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.fixing);
});

test('It marks failed hints as failed with no improvement', (t) => {
    const prev = { 'compat-api/css': 0, 'compat-api/html': 2 };
    const next = { 'compat-api/css': 0, 'compat-api/html': 2 };
    const status = determineHintStatus(prev, next);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.failed);
});
