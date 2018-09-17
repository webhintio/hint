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
import * as hint from 'hint';
import * as config from 'hint/dist/src/lib/config';
import * as loader from 'hint/dist/src/lib/utils/resource-loader'; // eslint-disable-line
import { Problem, Severity, UserConfig } from 'hint/dist/src/lib/types';

// Connect to the language client
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();

/* istanbul ignore next */
const trace = (message: string): void => {
    return console.log(message);
};

const loadModule = async <T>(context: string, name: string): Promise<T> => {
    return await Files.resolveModule2(context, name, null, trace);
};

// Load a user configuration, falling back to 'development' if none exists.
const loadUserConfig = (directory: string, Configuration: typeof config.Configuration): UserConfig => {
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
const loadEngine = async (directory: string, configuration: config.Configuration): Promise<hint.Engine> => {
    const { loadResources } = await loadModule<typeof loader>(directory, 'hint/dist/src/lib/utils/resource-loader');
    const resources = loadResources(configuration);
    const { Engine } = await loadModule<typeof hint>(directory, 'hint');

    return new Engine(configuration, resources);
};

// Load both webhint and a configuration, adjusting it as needed for this extension
const loadWebHint = async (directory: string): Promise<hint.Engine> => {
    const { Configuration } = await loadModule<typeof config>(directory, 'hint/dist/src/lib/config');
    const userConfig = loadUserConfig(directory, Configuration);

    // The vscode extension only works with the local connector
    userConfig.connector = { name: 'local' };

    if (!userConfig.parsers) {
        userConfig.parsers = [];
    }

    // Ensure the HTML parser is loaded
    if (userConfig.parsers.indexOf('html') === -1) {
        userConfig.parsers.push('html');
    }

    return await loadEngine(directory, Configuration.fromConfig(userConfig));
};

let workspace: string;
let engine: hint.Engine;

connection.onInitialize(async (params) => {
    try {
        // TODO: support multiple workspaces (`params.workspaceFolders`)
        workspace = params.rootPath;
        engine = await loadWebHint(workspace);
    } catch (e) {
        console.error(e);
        connection.window.showErrorMessage('[webhint] Load failed. Add it via `npm install hint --save-dev`.');
    }

    return { capabilities: { textDocumentSync: documents.syncKind } };
});

// Translate a webhint severity into the VSCode DiagnosticSeverity format.
const webhintToDiagnosticServerity = (severity: Severity): DiagnosticSeverity => {
    switch (severity) {
        case 2:
            return DiagnosticSeverity.Error;
        case 1:
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

// A watched .hintrc has changed. Reload the engine and re-validate documents.
connection.onDidChangeWatchedFiles(async () => {
    engine = await loadWebHint(workspace);
    const docs = documents.all();

    for (let i = 0; i < docs.length; i++) {
        await validateTextDocument(docs[i]);
    }
});

// Re-validate the document whenever the content changes.
documents.onDidChangeContent(async (change) => {
    await validateTextDocument(change.document);
});

// Listen on the text document manager and connection
documents.listen(connection);
connection.listen();
