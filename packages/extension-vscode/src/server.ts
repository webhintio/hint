import * as path from 'path';
import { URL } from 'url';

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
import { Problem, Severity, UserConfig } from 'hint/dist/src/lib/types';

// Load a user configuration, falling back to 'web-recommended' if none exists.
const loadUserConfig = (): UserConfig => {
    const defaultConfig: UserConfig = { extends: ['web-recommended'] };

    try {
        const configPath = Configuration.getFilenameForDirectory(process.cwd());
        const resolvedPath = path.resolve(process.cwd(), configPath);

        return Configuration.loadConfigFile(resolvedPath) || defaultConfig;
    } catch (e) {
        return defaultConfig;
    }
};

const userConfig = loadUserConfig();

// The vscode extension only works with the local connector
userConfig.connector = { name: 'local' };

if (!userConfig.parsers) {
    userConfig.parsers = [];
}

// Ensure the HTML parser is loaded
if (userConfig.parsers.indexOf('html') === -1) {
    userConfig.parsers.push('html');
}

// Create the webhint engine
const config = Configuration.fromConfig(userConfig);
const resources = loadResources(config);
const engine = new Engine(config, resources);

// Connect to the language client
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
