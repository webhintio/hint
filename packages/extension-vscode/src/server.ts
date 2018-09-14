import * as path from 'path';
import { URL } from 'url';

import {
    createConnection,
    Files,
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

// Connect to the language client
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();

const trace = (message: string): void => {
    return console.log(message);
};

// Load a user configuration, falling back to 'development' if none exists.
const loadUserConfig = (directory: string): UserConfig => {
    const defaultConfig: UserConfig = { extends: ['development'] };

    try {
        const configPath = Configuration.getFilenameForDirectory(directory);
        const resolvedPath = path.resolve(directory, configPath);

        return Configuration.loadConfigFile(resolvedPath) || defaultConfig;
    } catch (e) {
        return defaultConfig;
    }
};

// Load a copy of webhint with the provided configuration
const loadEngine = async (directory: string, userConfig: UserConfig): Promise<Engine> => {
    const config = Configuration.fromConfig(userConfig);
    const resources = loadResources(config);
    const hint = await Files.resolveModule2(directory, 'hint', null, trace);
    const WebHintEngine = hint.Engine as typeof Engine;

    return new WebHintEngine(config, resources);
};

// Load both webhint and a configuration, adjusting it as needed for this extension
const loadWebHint = async (directory: string): Promise<Engine> => {
    const userConfig = loadUserConfig(directory);

    // The vscode extension only works with the local connector
    userConfig.connector = { name: 'local' };

    if (!userConfig.parsers) {
        userConfig.parsers = [];
    }

    // Ensure the HTML parser is loaded
    if (userConfig.parsers.indexOf('html') === -1) {
        userConfig.parsers.push('html');
    }

    return await loadEngine(directory, userConfig);
};

let engine: Engine;

connection.onInitialize(async (params) => {
    try {
        // TODO: support multiple workspaces (`params.workspaceFolders`)
        engine = await loadWebHint(params.rootPath);
    } catch (e) {
        console.error(e);
        connection.window.showErrorMessage('[webhint] Load failed. Add it via `npm install hint --save-dev`.');
    }

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
        message: `${problem.message}\n(${problem.hintId})`,
        range: {
            end: { character, line },
            start: { character, line }
        },
        severity: webhintToDiagnosticServerity(problem.severity),
        source: 'webhint'
    };
};

const validateTextDocument = async (textDocument: TextDocument): Promise<void> => {

    // Ignore if `connection.onInitialize` failed to load webhint.
    if (!engine) {
        return;
    }

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
