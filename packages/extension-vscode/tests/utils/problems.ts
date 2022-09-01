import test from 'ava';

import { Problem, Severity } from '@hint/utils-types';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { getFeatureNameFromDiagnostic, problemToDiagnostic } from '../../src/utils/problems';

test('It translates a basic problem correctly', (t) => {
    const textDocument = TextDocument.create('document', 'text', 1, '');
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        hintId: 'test-id-1',
        location,
        message: 'Test Message 1',
        severity: Severity.warning
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);

    t.is(diagnostic.message, problem.message);
    t.is(diagnostic.code, problem.hintId);
    t.is(diagnostic.severity, DiagnosticSeverity.Warning);
    t.is(diagnostic.range.start.line, location.line);
    t.is(diagnostic.range.start.character, location.column);
    t.is(diagnostic.range.end.character, location.endColumn);
    t.is(diagnostic.range.end.line, location.endLine);
});

test('It translates missing location correctly', (t) => {
    const textDocument = TextDocument.create('document', 'text', 1, '');
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

    const diagnostic = problemToDiagnostic(problem, textDocument);

    t.is(diagnostic.severity, DiagnosticSeverity.Error);
    t.is(diagnostic.range.start.line, 0);
    t.is(diagnostic.range.start.character, 0);
});

test('It translates missing endColumn and endLine properties correctly', (t) => {
    const textDocument = TextDocument.create('document', 'text', 1, 'This is an error message');

    const location = {
        column: 5,
        line: 0
    };

    const problem = {
        hintId: 'test-id-1',
        location,
        message: 'Test Message 1',
        severity: Severity.hint
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);

    t.is(diagnostic.message, problem.message);
    t.is(diagnostic.code, problem.hintId);
    t.is(diagnostic.severity, DiagnosticSeverity.Hint);
    t.is(diagnostic.range.start.line, location.line);
    t.is(diagnostic.range.start.character, location.column);
    t.is(diagnostic.range.end.character, location.column + 2);
    t.is(diagnostic.range.end.line, location.line);
});

test('It translates missing endColumn and endLine properties correctly when the word is between quotes', (t) => {
    const textDocument = TextDocument.create('document', 'text', 1, 'This is an "error" message');

    const location = {
        column: 12,
        line: 0
    };

    const problem = {
        hintId: 'test-id-1',
        location,
        message: 'Test Message 1',
        severity: Severity.hint
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);

    t.is(diagnostic.message, problem.message);
    t.is(diagnostic.code, problem.hintId);
    t.is(diagnostic.severity, DiagnosticSeverity.Hint);
    t.is(diagnostic.range.start.line, location.line);
    t.is(diagnostic.range.start.character, location.column);
    t.is(diagnostic.range.end.character, location.column + 5);
    t.is(diagnostic.range.end.line, location.line);
});

test('It translates missing endColumn and endLine properties correctly in a multiline TextDocument', (t) => {
    const textDocument = TextDocument.create('document', 'text', 1, `


    This is an "error" message
`);

    const location = {
        column: 16,
        line: 3
    };

    const problem = {
        hintId: 'test-id-1',
        location,
        message: 'Test Message 1',
        severity: Severity.hint
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);

    t.is(diagnostic.message, problem.message);
    t.is(diagnostic.code, problem.hintId);
    t.is(diagnostic.severity, DiagnosticSeverity.Hint);
    t.is(diagnostic.range.start.line, location.line);
    t.is(diagnostic.range.start.character, location.column);
    t.is(diagnostic.range.end.character, location.column + 5);
    t.is(diagnostic.range.end.line, location.line);
});

test('It translates missing endColumn and endLine properties correctly when the caracter - is present', (t) => {
    const textDocument = TextDocument.create('document', 'text', 1, `


    This is an "error-with-dashes" message
`);

    const location = {
        column: 16,
        line: 3
    };

    const problem = {
        hintId: 'test-id-1',
        location,
        message: 'Test Message 1',
        severity: Severity.hint
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);

    t.is(diagnostic.message, problem.message);
    t.is(diagnostic.code, problem.hintId);
    t.is(diagnostic.severity, DiagnosticSeverity.Hint);
    t.is(diagnostic.range.start.line, location.line);
    t.is(diagnostic.range.start.character, location.column);
    t.is(diagnostic.range.end.character, location.column + 17);
    t.is(diagnostic.range.end.line, location.line);
});

test.only('It correctly gets the name from a message', (t) => {

    const textDocument = TextDocument.create('document', 'text', 1, `
    This is an "error-with-dashes" message
`);

    const location = {
        column: 16,
        line: 3
    };

    const problem = {
        hintId: 'compat-api/test-id-1',
        location,
        message: `'box-flex' is not supported by Chrome, Chrome Android, Edge, Firefox, Firefox for Android, Opera, Safari, Safari on iOS, Samsung Internet. Add '-webkit-box-flex' to support Chrome, Chrome Android 18+, Edge 12+, Opera 15+, Safari 3+, Safari on iOS, Samsung Internet. Add '-moz-box-flex' to support Firefox, Firefox for Android 4+`,
        severity: Severity.hint
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);
    const featureName = getFeatureNameFromDiagnostic(diagnostic);

    t.is(featureName, 'box-flex');
});

test('It correctly handles the case were no problem was found in the message', (t) => {

    const textDocument = TextDocument.create('document', 'text', 1, `
    This is an "error-with-dashes" message
`);

    const location = {
        column: 16,
        line: 3
    };

    const problem = {
        hintId: 'compat-api/test-id-1',
        location,
        message: `This message does not contain the problem in an accepted format.`,
        severity: Severity.hint
    } as Problem;

    const diagnostic = problemToDiagnostic(problem, textDocument);
    const featureName = getFeatureNameFromDiagnostic(diagnostic);

    t.is(featureName, null);
});
