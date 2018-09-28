import { spawn } from 'child_process';
import { access } from 'fs';
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

import * as notifications from './notifications';

// TODO: Enhance `hint` exports so everything can be imported directly.
import * as hint from 'hint';
import * as config from 'hint/dist/src/lib/config';
import * as loader from 'hint/dist/src/lib/utils/resource-loader'; // eslint-disable-line
import { HintsConfigObject, Problem, Severity, UserConfig } from 'hint/dist/src/lib/types';

let workspace = '';

// Connect to the language client.
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();

// Determine if a project is using yarn by checking for `yarn.lock`.
const hasYarnLock = (directory: string): Promise<boolean> => {
    return new Promise((resolve) => {
        access(path.join(directory, 'yarn.lock'), (err) => {
            resolve(!err);
        });
    });
};

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
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

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
        const addWebHint = 'Add webhint';
        const answer = await connection.window.showWarningMessage(
            'Unable to find webhint. Add it to this project?',
            { title: addWebHint },
            { title: 'Cancel' }
        );

        if (answer && answer.title === addWebHint) {
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

// Load a user configuration, falling back to 'development' if none exists.
const loadUserConfig = (directory: string, Configuration: typeof config.Configuration): UserConfig => {
    const defaultConfig: UserConfig = { extends: ['development'] };

    try {
        const configPath = Configuration.getFilenameForDirectory(directory);
        const resolvedPath = path.resolve(directory, configPath!); // Ok if `configPath` is `null`; will fall back to `defaultConfig` in `catch`

        return Configuration.loadConfigFile(resolvedPath) || defaultConfig;
    } catch (e) {
        return defaultConfig;
    }
};

// Load a copy of webhint with the provided configuration.
const loadEngine = async (directory: string, configuration: config.Configuration): Promise<hint.Engine | null> => {
    const localLoader = await loadModule<typeof loader>(directory, 'hint/dist/src/lib/utils/resource-loader');
    const localHint = await loadModule<typeof hint>(directory, 'hint');

    if (!localLoader || !localHint) {
        return null;
    }

    const resources = localLoader.loadResources(configuration);

    return new localHint.Engine(configuration, resources);
};

// Load both webhint and a configuration, adjusting it as needed for this extension.
const loadWebHint = async (directory: string): Promise<hint.Engine | null> => {
    const configModule = await loadModule<typeof config>(directory, 'hint/dist/src/lib/config');

    // If no module was returned, the user cancelled installing webhint.
    if (!configModule) {
        return null;
    }

    const { Configuration } = configModule;
    const userConfig = loadUserConfig(directory, Configuration);

    // The vscode extension only works with the local connector.
    userConfig.connector = { name: 'local' };

    if (!userConfig.hints) {
        userConfig.hints = { };
    }

    /*
     * Ensure `http-compression` is disabled; there could be issues loading
     * `iltorb` if it was compiled for a different version of `node` and the
     * `local` connector doesn't support it anyway.
     */
    (userConfig.hints as HintsConfigObject)['http-compression'] = 'off';

    if (!userConfig.parsers) {
        userConfig.parsers = [];
    }

    // Ensure the HTML parser is loaded.
    if (userConfig.parsers.indexOf('html') === -1) {
        userConfig.parsers.push('html');
    }

    let engine: hint.Engine | null = null;

    try {
        engine = await loadEngine(directory, Configuration.fromConfig(userConfig));

        return engine;
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
            return await loadWebHint(directory);
        }

        return null;
    }
};

let engine: hint.Engine | null = null;
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
            engine = await loadWebHint(workspace);
        }

        // Gracefully exit if all attempts to get an engine failed.
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
    engine = await loadWebHint(workspace);
    await Promise.all(documents.all().map((doc) => {
        return validateTextDocument(doc);
    }));
});

// Re-validate the document whenever the content changes.
documents.onDidChangeContent(async (change) => {
    await validateTextDocument(change.document);
});

// Listen on the text document manager and connection.
documents.listen(connection);
connection.listen();
