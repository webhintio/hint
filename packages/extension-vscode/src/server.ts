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

    let { column: character, line } = problem.location;

    // Move (-1, -1) or similar to (0, 0) so VSCode underlines the start of the document.
    if (character < 0 || line < 0) {
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

let validating = false;
let validationQueue: TextDocument[] = [];

// Queue a document to validate later (if needed). Returns `true` if queued.
const queueValidationIfNeeded = (textDocument: TextDocument): boolean => {
    if (!validating) {
        return false;
    }

    // Drop stale queued validations for the same document.
    validationQueue = validationQueue.filter((doc) => {
        return doc.uri !== textDocument.uri;
    });

    // Queue this document to be validated.
    validationQueue.push(textDocument);

    // Wait for the current validation to finish.
    return true;
};

const validateTextDocument = async (textDocument: TextDocument): Promise<void> => {

    // Ignore if `connection.onInitialize` failed to load webhint.
    if (!engine) {
        return;
    }

    // Wait if another doc is validating to avoid interleaving errors.
    if (queueValidationIfNeeded(textDocument)) {
        return;
    }

    try {
        validating = true;

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

    } finally {
        validating = false;

        // Validate any documents queued during validation.
        if (validationQueue.length) {
            validateTextDocument(validationQueue.shift());
        }
    }
};

// A watched .hintrc has changed. Reload the engine and re-validate documents.
connection.onDidChangeWatchedFiles(async () => {
    engine = await loadWebHint(workspace);
    await Promise.all(documents.all().map((doc) => {
        return validateTextDocument(doc);
    }));
});

// Re-validate the document whenever the content changes.
documents.onDidChangeContent(async (change) => {
    await validateTextDocument(change.document);
});

// Listen on the text document manager and connection
documents.listen(connection);
connection.listen();
