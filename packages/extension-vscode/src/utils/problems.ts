import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { Problem, Severity } from '@hint/utils-types';

export type WebhintDiagnosticData = {
    problem: Problem;
};

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
export const problemToDiagnostic = (problem: Problem, textDocument: TextDocument): Diagnostic => {

    let { column: character, endColumn, endLine, line } = problem.location;

    // Move (-1, -1) or similar to (0, 0) so VSCode underlines the start of the document.
    if (character < 0 || line < 0) {
        character = 0;
        line = 0;
    }

    if (endColumn === undefined) {
        const offset = textDocument.offsetAt({ character, line });
        const content = textDocument.getText();

        let count = offset + 1;

        while (content[count]?.match(/\w|\d|-/)) {
            count++;
        }

        endColumn = character + count - offset;
    }

    if (!endLine) {
        endLine = line;
    }

    const docHref = problem.documentation?.length ? problem.documentation[0].link : `https://webhint.io/docs/user-guide/hints/hint-${problem.hintId}/`;

    return {
        code: problem.hintId,
        codeDescription: { href: docHref },
        data: { problem } as WebhintDiagnosticData,
        message: `${problem.message}`,
        range: {
            end: { character: endColumn, line: endLine },
            start: { character, line }
        },
        severity: webhintToDiagnosticServerity(problem.severity)
    };
};

export const getFeatureNameFromDiagnostic = (diagnostic: Diagnostic) => {
    const matches = diagnostic.message.match(/(.*?)'(.*?)'(.*?)/);

    if (matches && matches.length > 1) {
        return matches[2];
    }

    return null;
};
