import { createConnection, InitializeResult, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { Analyzer } from './utils/analyze';
import { QuickFixActionProvider } from './quickFixProvider';

import * as notifications from './utils/notifications';

const [,, globalStoragePath, sourceName] = process.argv;
const connection = createConnection(ProposedFeatures.all);
const analyzer = new Analyzer(globalStoragePath, connection, sourceName);
const documents = new TextDocuments(TextDocument);
const quickFixActionProvider = new QuickFixActionProvider(documents, sourceName);

let workspace = '';

connection.onInitialize((params) => {
    /*
     * TODO: Cache multiple webhint instances based on analyzed document paths,
     * which should allow ignoring workspaces entirely.
     */
    workspace = params.rootPath || '';

    const resultObject: InitializeResult = {capabilities: {textDocumentSync: TextDocumentSyncKind.Full}};

    resultObject.capabilities.codeActionProvider = true;
    resultObject.capabilities.executeCommandProvider = {
        commands: [
            'vscode-webhint/ignore-category-project',
            'vscode-webhint/ignore-category-global',
            'vscode-webhint/ignore-hint-project',
            'vscode-webhint/ignore-hint-global'
        ]
    };

    return resultObject;
});

connection.onNotification(notifications.reloadAllProjectsConfig, async () => {
    const message = `Reloading .hintrc file from:\n ${globalStoragePath}`;


    console.log(message);
    analyzer.onConfigurationChanged();
    await Promise.all(documents.all().map((doc) => {
        return analyzer.validateTextDocument(doc, globalStoragePath);
    }));
});

// A watched .hintrc has changed. Reload the engine and re-validate documents.
connection.onDidChangeWatchedFiles(async () => {
    analyzer.onConfigurationChanged();
    await Promise.all(documents.all().map((doc) => {
        return analyzer.validateTextDocument(doc, workspace);
    }));
});

connection.onCodeAction(quickFixActionProvider.provideCodeActions.bind(quickFixActionProvider));

connection.onExecuteCommand(() => {
    return;
});

// Re-validate the document whenever the content changes.
documents.onDidChangeContent(async (change) => {
    if (!change.document.uri.startsWith('file://')) {
        return; // Only analyze local files (e.g. not internal vscode:// files)
    }
    await analyzer.validateTextDocument(change.document, workspace);
});

// Listen on the text document manager and connection.
documents.listen(connection);
connection.listen();
