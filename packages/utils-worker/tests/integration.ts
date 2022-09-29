import test from 'ava';

import { getResults } from './helpers/runner';
import { readFile } from './helpers/fixtures';

test('It runs in a real web worker', async (t) => {
    const data = { html: await readFile('fixtures/basic-hints.html') };
    const results = await getResults({ userConfig: { language: 'en-us' } }, data, t.log);
    const problems = results.problems;

    const xContentTypeOptionsResults = problems.filter((problem) => {
        return problem.hintId === 'x-content-type-options';
    });

    // Validate a `fetch::end` related hint
    t.is(xContentTypeOptionsResults.length, 1);

    const axeLanguageResults = problems.filter((problem) => {
        return problem.hintId === 'axe/language';
    });

    // Validate a `can-evaluate::script` related hint
    t.is(axeLanguageResults.length, 1);

    const compatHtmlResults = problems.filter((problem) => {
        return problem.hintId === 'compat-api/html';
    });

    // Validate a `traverse` related hint
    t.is(compatHtmlResults.length, 1);
});

test('It respects provided configuration', async (t) => {
    const data = { html: await readFile('fixtures/basic-hints.html') };
    const results = await getResults({
        userConfig: {
            hints: {
                'axe/language': 'off',
                'compat-api/html': ['default', { ignore: ['dialog'] }]
            },
            language: 'en-us'
        }
    }, data, t.log);
    const problems = results.problems;

    const axeLanguageResults = problems.filter((problem) => {
        return problem.hintId === 'axe/language';
    });

    // Validate `axe/language` was disabled
    t.is(axeLanguageResults.length, 0);

    const compatHtmlResults = problems.filter((problem) => {
        return problem.hintId === 'compat-api/html';
    });

    // Validate `compat-api/html` was configured
    t.is(compatHtmlResults.length, 0);
});

test('It allows disabling hints by default', async (t) => {
    const data = { html: await readFile('fixtures/basic-hints.html') };
    const results = await getResults({
        defaultHintSeverity: 'off',
        userConfig: {
            hints: { 'compat-api/html': 'default' },
            language: 'en-us'
        }
    }, data, t.log);
    const problems = results.problems;
    const axeLanguageResults = problems.filter((problem) => {
        return problem.hintId === 'axe/language';
    });

    // Validate `axe/language` was disabled
    t.is(axeLanguageResults.length, 0);

    const compatHtmlResults = problems.filter((problem) => {
        return problem.hintId === 'compat-api/html';
    });

    // Validate `compat-api/html` was configured
    t.is(compatHtmlResults.length, 1);
});

test.only('Reported problems should have an elementId', async (t) => {
    const data = { html: await readFile('fixtures/basic-hints.html') };
    const results = await getResults({
        defaultHintSeverity: 'off',
        userConfig: {
            hints: { 'compat-api/html': 'default' },
            language: 'en-us'
        }
    }, data, t.log);

    for (const problem of results.problems) {
        t.not(problem.location.elementId, undefined);
    }
});
