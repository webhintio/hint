import test from 'ava';
import { Category } from 'hint';

import { determineHintStatus, HintStatus } from '../../../src/devtools/utils/hints';

const toHintResult = (id: string, problems: any[]) => {
    return {
        helpURL: '',
        id,
        name: '',
        problems
    };
};

const toPassResult = (id: string) => {
    return toHintResult(id, []);
};

const toFailResult = (id: string, count: number) => {
    return toHintResult(id, new Array(count).fill({ message: 'problem message' }));
};

const mockResults = (url: string, pass: string[], fail: string[], nFailures = 1) => {
    const failures = fail.map((id) => {
        return toFailResult(id, nFailures);
    });

    return {
        categories: [
            {
                hints: [...pass.map(toPassResult), ...failures],
                name: Category.compatibility,
                passed: pass.length
            }
        ],
        url
    };
};

const mockStorage = () => {
    const store: { [key: string]: any } = {};

    return {
        getItem(key: string): any {
            return store[key];
        },
        setItem(key: string, value: any) {
            store[key] = value;
        }
    };
};

test('It marks failed hints as failed', (t) => {
    const config = {};
    const results = mockResults('https://example.com', [], ['compat-api/css', 'compat-api/html']);
    const storage = mockStorage();
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.failed);
    t.is(status['hint-compat-api/html'], HintStatus.failed);
});

test('It marks passed hints as passed with no history', (t) => {
    const config = {};
    const results = mockResults('https://example.com', ['compat-api/css', 'compat-api/html'], []);
    const storage = mockStorage();
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.passed);
});

test('It marks passed hints as fixed with failed history', (t) => {
    const config = {};
    const prevResults = mockResults('https://example.com', ['compat-api/css'], ['compat-api/html']);
    const results = mockResults('https://example.com', ['compat-api/css', 'compat-api/html'], []);
    const storage = mockStorage();

    determineHintStatus(config, prevResults, storage);
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.fixed);
});

test('It marks failed hints as fixing with improvement vs history', (t) => {
    const config = {};
    const prevResults = mockResults('https://example.com', ['compat-api/css'], ['compat-api/html'], 3);
    const results = mockResults('https://example.com', ['compat-api/css'], ['compat-api/html'], 2);
    const storage = mockStorage();

    determineHintStatus(config, prevResults, storage);
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.fixing);
});

test('It marks failed hints as failed with no improvement', (t) => {
    const config = {};
    const prevResults = mockResults('https://example.com', ['compat-api/css'], ['compat-api/html'], 2);
    const results = mockResults('https://example.com', ['compat-api/css'], ['compat-api/html'], 2);
    const storage = mockStorage();

    determineHintStatus(config, prevResults, storage);
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.failed);
});

test('It marks previously failed hints as passed with changed url', (t) => {
    const config = {};
    const prevResults = mockResults('https://example1.com', ['compat-api/css'], ['compat-api/html']);
    const results = mockResults('https://example2.com', ['compat-api/css', 'compat-api/html'], []);
    const storage = mockStorage();

    determineHintStatus({browserslist: 'defaults, not ie 11'}, prevResults, storage);
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.passed);
});

test('It marks previously failed hints as passed with changed browsers', (t) => {
    const config = {};
    const prevResults = mockResults('https://example.com', ['compat-api/css'], ['compat-api/html']);
    const results = mockResults('https://example.com', ['compat-api/css', 'compat-api/html'], []);
    const storage = mockStorage();

    determineHintStatus({browserslist: 'defaults, not ie 11'}, prevResults, storage);
    const status = determineHintStatus(config, results, storage);

    t.is(status['hint-compat-api/css'], HintStatus.passed);
    t.is(status['hint-compat-api/html'], HintStatus.passed);
});
