import * as fs from 'fs';
import { URL } from 'url';

import { createConnection, ProposedFeatures, TextDocuments, TextDocument } from 'vscode-languageserver';

import * as hint from 'hint';
import { HintsConfigObject, UserConfig } from 'hint';

import { initTelemetry, updateTelemetry } from './utils/app-insights';
import { trackClose, trackResult, trackSave } from './utils/analytics';
import * as notifications from './utils/notifications';
import { hasFile, installPackages, loadPackage } from './utils/packages';
import { problemToDiagnostic } from './utils/problems';

const [,, globalStoragePath, telemetryEnabled ] = process.argv;
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();
const defaultConfig: UserConfig = { extends: ['development'] };
const instrumentationKey = '8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d';
const defaultProperties = { 'extension-version': '1.0.5' };

let workspace = '';

const promptToAddWebhint = async () => {
    const addWebhint = 'Add webhint';
    const cancel = 'Cancel';
    const answer = await connection.window.showWarningMessage(
        'A local `.hintrc` was found. Add webhint to this project?',
        { title: addWebhint },
        { title: cancel }
    );

    if (answer && answer.title === addWebhint) {
        try {
            connection.sendNotification(notifications.showOutput);
            await installPackages(['hint', '@hint/configuration-development'], { cwd: workspace });
            connection.window.showInformationMessage('Finished installing webhint!');
        } catch (err) {
            connection.window.showErrorMessage(`Unable to install webhint:\n${err}`);
        }
    }
};

const loadSharedWebhint = async (): Promise<typeof hint | null> => {
    /* 
     * Per VS Code docs globalStoragePath may not exist but parent folder will.
     * https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalStoragePath
     */
    if (!await hasFile(globalStoragePath)) {
        await fs.promises.mkdir(globalStoragePath);
    }

    try {
        return loadPackage('hint', { paths: [globalStoragePath] });
    } catch (e) {
        connection.sendNotification(notifications.showOutput);
        try {
            await installPackages(['hint', '@hint/configuration-development'], { cwd: globalStoragePath });
            return loadPackage('hint', { paths: [globalStoragePath] });
        } catch (err) {
            console.error('Unable to install or load a shared webhint instance', err);
            return null;
        }
    }
};

const loadWebhint = async (directory: string, prompt = true): Promise<typeof hint | null> => {
    try {
        return loadPackage('hint', { paths: [directory] });
    } catch (e) {
        if (prompt && await hasFile('.hintrc', directory)) {
            await promptToAddWebhint();
            return loadWebhint(directory, false);
        }

        return loadSharedWebhint();
    }
};

// Load both webhint and a configuration, adjusting it as needed for this extension.
const initWebhint = async (directory: string): Promise<hint.Analyzer | null> => {
    const hintModule = await loadWebhint(directory);

    // If no module was returned, the user cancelled installing webhint.
    if (!hintModule) {
        return null;
    }

    const userConfig = hintModule.getUserConfig(directory) || defaultConfig;

    // The vscode extension only works with the local connector.
    userConfig.connector = { name: 'local' };

    if (!userConfig.hints) {
        userConfig.hints = {};
    }

    /*
     * Ensure `http-compression` is disabled; there could be issues loading
     * `iltorb` if it was compiled for a different version of `node` and the
     * `local` connector doesn't support it anyway.
     */
    (userConfig.hints as HintsConfigObject)['http-compression'] = 'off';

    /*
     * Remove formatters because the extension doesn't use them.
     */
    userConfig.formatters = [];

    if (!userConfig.parsers) {
        userConfig.parsers = [];
    }

    // Ensure the HTML parser is loaded.
    if (userConfig.parsers.indexOf('html') === -1) {
        userConfig.parsers.push('html');
    }

    let webhint: hint.Analyzer | null = null;

    try {
        webhint = hintModule.createAnalyzer(userConfig);

        return webhint;
    } catch (e) {
        // Instantiating webhint failed, log the error to the webhint output panel to aid debugging.
        console.error(e);

        // Prompt the user to retry after checking their configuration.
        const retry = 'Retry';
        const answer = await connection.window.showErrorMessage(
            'Unable to start webhint. Ensure you are using the latest version of the `hint` and `@hint/configuration-development` packages.',
            { title: retry },
            { title: 'Ignore' }
        );

        // Retry if asked.
        if (answer && answer.title === retry) {
            return await initWebhint(directory);
        }

        return null;
    }
};

let webhint: hint.Analyzer | null = null;
let loaded = false;
let validating = false;
let validationQueue: TextDocument[] = [];

connection.onInitialize((params) => {
    // Reset on initialization to facilitate testing.
    loaded = false;
    validating = false;
    validationQueue = [];

    // TODO: Support multiple workspaces (`params.workspaceFolders`).
    workspace = params.rootPath || '';

    return { capabilities: { textDocumentSync: documents.syncKind } };
});

connection.onNotification(notifications.telemetryEnabledChanged, (telemetryEnabled: 'ask' | 'enabled' | 'disabled') => {
    updateTelemetry(telemetryEnabled === 'enabled');
});

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
    // Wait if another doc is validating to avoid interleaving errors.
    if (queueValidationIfNeeded(textDocument)) {
        return;
    }

    try {
        validating = true;

        // Try to load webhint if this is the first validation.
        if (!loaded) {
            loaded = true;
            webhint = await initWebhint(workspace);
        }

        // Gracefully exit if all attempts to get an engine failed.
        if (!webhint) {
            return;
        }

        // In VSCode on Windows, the `:` is escaped after the drive letter in `textDocument.uri`.
        const url = new URL(unescape(textDocument.uri));

        // Pass content directly to validate unsaved changes.
        const content = textDocument.getText();
        const results = await webhint.analyze({
            content,
            url
        });

        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({
            diagnostics: results.length > 0 ? results[0].problems.map(problemToDiagnostic) : [],
            uri: textDocument.uri
        });

        trackResult(textDocument.uri, {
            hints: webhint.resources.hints,
            problems: results.length > 0 ? results[0].problems : []
        });

    } finally {
        validating = false;

        // Validate any documents queued during validation.
        if (validationQueue.length) {
            validateTextDocument(validationQueue.shift() as TextDocument);
        }
    }
};

// A watched .hintrc has changed. Reload the engine and re-validate documents.
connection.onDidChangeWatchedFiles(async () => {
    webhint = await initWebhint(workspace);
    await Promise.all(documents.all().map((doc) => {
        return validateTextDocument(doc);
    }));
});

// Re-validate the document whenever the content changes.
documents.onDidChangeContent(async (change) => {
    await validateTextDocument(change.document);
});

// Clean up cached results when a document is closed to avoid leaking memory.
documents.onDidClose(({ document }) => {
    trackClose(document.uri);
});

// Report deltas in cached results when a document is saved.
documents.onDidSave(({ document }) => {
    trackSave(document.uri);
});

// Listen on the text document manager and connection.
documents.listen(connection);
connection.listen();

initTelemetry(instrumentationKey, defaultProperties, telemetryEnabled === 'enabled');
