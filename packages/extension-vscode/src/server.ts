import { spawn } from 'child_process';
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

import * as hint from 'hint';
import { HintsConfigObject, Problem, Severity, UserConfig } from 'hint';
import { appInsights, hasYarnLock } from '@hint/utils';

import * as notifications from './notifications';
import { trackClose, trackResult, trackSave } from './utils/analytics';

let workspace = '';
let openExternalCompleteListener: Function | null = null;

// Connect to the language client.
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();
const defaultConfig: UserConfig = { extends: ['development'] };

// Adds webhint and configuration-development to the current workspace.
const installWebhint = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        connection.sendNotification(notifications.showOutput);

        // Build the installation commands.
        const packages = 'hint @hint/configuration-development';
        const cmd = process.platform === 'win32' ? '.cmd' : '';
        const npm = `npm${cmd} install ${packages} --save-dev --verbose`;
        const yarn = `yarn${cmd} add ${packages} --dev`;

        // Install via `yarn` if `yarn.lock` is present, `npm` otherwise.
        const isUsingYarn = await hasYarnLock(workspace);
        const command = isUsingYarn ? yarn : npm;
        const parts = command.split(' ');

        // Actually start the installation.
        const child = spawn(parts[0], parts.slice(1));

        // Show progress in the output window for the extension.
        child.stdout!.pipe(process.stdout);
        child.stderr!.pipe(process.stderr);

        child.on('exit', (code) => {
            if (code) {
                connection.window.showErrorMessage(`Unable to install webhint. ${code}`);
                reject(code);
            } else {
                connection.window.showInformationMessage('Finished installing webhint!');
                resolve();
            }
        });
    });
};

/* istanbul ignore next */
const trace = (message: string): void => {
    return console.log(message);
};

const loadModule = async <T>(context: string, name: string): Promise<T | null> => {
    let module: T | null = null;

    try {
        module = await Files.resolveModule2(context, name, '', trace);
    } catch (e) {
        const addWebHintLocally = 'Add webhint';
        const cancel = 'Cancel';
        const answer = await connection.window.showWarningMessage(
            'Unable to find webhint. Add it to this project?',
            { title: addWebHintLocally },
            { title: cancel }
        );

        if (answer && answer.title !== cancel) {
            try {
                await installWebhint();

                return loadModule<T>(context, name);
            } catch (err) {
                connection.window.showErrorMessage(`Unable to install webhint:\n${err}`);
            }
        }
    }

    return module;
};

// Load both webhint and a configuration, adjusting it as needed for this extension.
const loadWebhint = async (directory: string): Promise<hint.Analyzer | null> => {
    const hintModule = await loadModule<typeof hint>(directory, 'hint');

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
            return await loadWebhint(directory);
        }

        return null;
    }
};

/* istanbul ignore next */
const showTelemetryMessage = async () => {
    if (appInsights.isConfigured()) {
        return;
    }

    const yesResponse = 'Yes';
    const noResponse = 'No';
    const learnResponse = 'Learn more';
    const answer = await connection.window.showInformationMessage(
        'Help us improve webhint by sending limited usage information (no personal information or URLs will be sent).',
        { title: yesResponse },
        { title: noResponse },
        { title: learnResponse }
    );

    if (answer && answer.title === yesResponse) {
        appInsights.enable();
    } else if (answer && answer.title === noResponse) {
        appInsights.disable();
    } else if (answer && answer.title === learnResponse) {
        connection.sendNotification(notifications.openExternal, 'https://webhint.io/docs/user-guide/telemetry/summary/');
        openExternalCompleteListener = () => {
            showTelemetryMessage();
        };
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

    showTelemetryMessage();

    connection.onNotification(notifications.openExternalComplete, () => {
        if (openExternalCompleteListener) {
            openExternalCompleteListener();
            openExternalCompleteListener = null;
        }
    });

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
            webhint = await loadWebhint(workspace);
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
    webhint = await loadWebhint(workspace);
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
