import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';

import { Problem, Severity } from '@hint/utils-types';

// Translate a webhint severity into the VSCode DiagnosticSeverity format.
const webhintToDiagnosticServerity = (severity: Severity): DiagnosticSeverity => {
    switch (severity) {
        case 4:
            return DiagnosticSeverity.Error;
        case 3:
            return DiagnosticSeverity.Warning;
        case 2:
            return DiagnosticSeverity.Hint;
        case 1:
            return DiagnosticSeverity.Information;
        default:
            return DiagnosticSeverity.Information;
    }
};

// Translate a webhint problem into the VSCode diagnostic format.
export const problemToDiagnostic = (problem: Problem): Diagnostic => {

    let { column: character, endColumn, endLine, line } = problem.location;

    // Move (-1, -1) or similar to (0, 0) so VSCode underlines the start of the document.
    if (character < 0 || line < 0) {
        character = 0;
        line = 0;
    }

    if (!endColumn || !endLine) {
        endColumn = character;
        endLine = line;
    }

    return {
        message: `${problem.message}\n(${problem.hintId})`,
        range: {
            end: { character: endColumn, line: endLine },
            start: { character, line }
        },
        severity: webhintToDiagnosticServerity(problem.severity),
        source: 'webhint'
    };
};
