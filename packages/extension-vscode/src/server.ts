import { createConnection, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { Analyzer } from './utils/analyze';

const [,, globalStoragePath] = process.argv;
const connection = createConnection(ProposedFeatures.all);
const analyzer = new Analyzer(globalStoragePath, connection);
const documents = new TextDocuments(TextDocument);

let workspace = '';

connection.onInitialize((params) => {
    /*
     * TODO: Cache multiple webhint instances based on analyzed document paths,
     * which should allow ignoring workspaces entirely.
     */
    workspace = params.rootPath || '';

    return { capabilities: { textDocumentSync: TextDocumentSyncKind.Full } };
});

// A watched .hintrc has changed. Reload the engine and re-validate documents.
connection.onDidChangeWatchedFiles(async () => {
    analyzer.onConfigurationChanged();
    await Promise.all(documents.all().map((doc) => {
        return analyzer.validateTextDocument(doc, workspace);
    }));
});

// Re-validate the document whenever the content changes.
documents.onDidChangeContent(async (change) => {
    await analyzer.validateTextDocument(change.document, workspace);
});

// Listen on the text document manager and connection.
documents.listen(connection);
connection.listen();
