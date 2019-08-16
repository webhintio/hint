import test from 'ava';

import { Problem, Severity } from 'hint';
import { DiagnosticSeverity } from 'vscode-languageserver';

import { problemToDiagnostic } from '../../src/utils/problems';

test('It translates a basic problem correctly', (t) => {
    const location = {
        column: 5,
        line: 7
    };

    const problem = {
        hintId: 'test-id-1',
        location,
        message: 'Test Message 1',
        severity: Severity.warning
    } as Problem;

    const diagnostic = problemToDiagnostic(problem);

    t.is(diagnostic.source, 'webhint');
    t.true(diagnostic.message.indexOf(problem.message || '') !== -1);
    t.true(diagnostic.message.indexOf(problem.hintId || '') !== -1);
    t.is(diagnostic.severity, DiagnosticSeverity.Warning);
    t.is(diagnostic.range.start.line, location.line);
    t.is(diagnostic.range.start.character, location.column);
});

test('It translates missing location correctly', (t) => {
    const location = {
        column: -1,
        line: -1
    };

    const problem = {
        hintId: 'test-id-2',
        location,
        message: 'Test Message 2',
        severity: Severity.error
    } as Problem;

    const diagnostic = problemToDiagnostic(problem);

    t.is(diagnostic.severity, DiagnosticSeverity.Error);
    t.is(diagnostic.range.start.line, 0);
    t.is(diagnostic.range.start.character, 0);
});
