import {
    createConnection,
    TextDocuments,
    TextDocument,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures
} from 'vscode-languageserver';

// TODO: Enhance `hint` exports so everything can be imported directly.
import { Engine } from 'hint';
import { Configuration } from 'hint/dist/src/lib/config';
import { loadResources } from 'hint/dist/src/lib/utils/resource-loader';
import { Problem, Severity } from 'hint/dist/src/lib/types';
import { URL } from 'url';

// TODO: Load the configuration from the workspace (if present)
const config = Configuration.fromConfig({
    connector: { name: 'local' },
    extends: ['web-recommended', 'progressive-web-apps']
});

// TODO: Load and use the workspace copies of `hint` and resources (if present)
const resources = loadResources(config);
const engine = new Engine(config, resources);

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();

connection.onInitialize(() => {
    return { capabilities: { textDocumentSync: documents.syncKind } };
});

// Translate a webhint severity into the VSCode DiagnosticSeverity format.
const webhintToDiagnosticServerity = (severity: Severity): DiagnosticSeverity => {
    switch (severity) {
        case Severity.error:
            return DiagnosticSeverity.Error;
        case Severity.warning:
            return DiagnosticSeverity.Warning;
        default:
            return DiagnosticSeverity.Hint;
    }
};

// Translate a webhint problem into the VSCode diagnostic format.
const problemToDiagnostic = (problem: Problem): Diagnostic => {

    let character = problem.location.column;
    let line = problem.location.line;

    // Move (-1, -1) to (0, 0) so VSCode underlines the start of the document.
    if (character < 0 && line < 0) {
        character = 0;
        line = 0;
    }

    return {
        message: problem.message,
        range: {
            end: { character, line },
            start: { character, line }
        },
        severity: webhintToDiagnosticServerity(problem.severity),
        source: 'webhint'
    };
};

const validateTextDocument = async (textDocument: TextDocument): Promise<void> => {

    // In VSCode on Windows, the `:` is escaped after the drive letter in `textDocument.uri`.
    const url = new URL(unescape(textDocument.uri));

    // Pass content directly to validate unsaved changes.
    const content = textDocument.getText();
    const problems = await engine.executeOn(url, { content });

    // Clear problems to avoid duplicates since vscode remembers them for us.
    engine.clear();

    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({
        diagnostics: problems.map(problemToDiagnostic),
        uri: textDocument.uri
    });
};

// Re-validate the document whenever the content changes.
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

// Listen on the text document manager and connection
documents.listen(connection);
connection.listen();
