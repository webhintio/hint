import * as https from 'https';
import { createConnection, ProposedFeatures, TextDocuments } from 'vscode-languageserver';

import { initTelemetry, updateTelemetry } from './utils/app-insights';
import { trackClose, trackSave } from './utils/analytics';
import { Analyzer } from './utils/analyze';
import * as notifications from './utils/notifications';

// Look two-levels up for `package.json` as this will be in `dist/src/` post-build.
const { version } = require('../../package.json');

const instrumentationKey = '8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d';
const defaultProperties = { 'extension-version': version };

const [,, globalStoragePath, telemetryEnabled] = process.argv;
const connection = createConnection(ProposedFeatures.all);
const analyzer = new Analyzer(globalStoragePath, connection);
const documents = new TextDocuments();

let workspace = '';

connection.onInitialize((params) => {
    /*
     * TODO: Cache multiple webhint instances based on analyzed document paths,
     * which should allow ignoring workspaces entirely.
     */
    workspace = params.rootPath || '';

    return { capabilities: { textDocumentSync: documents.syncKind } };
});

connection.onNotification(notifications.telemetryEnabledChanged, (telemetryEnabled: 'ask' | 'enabled' | 'disabled') => {
    updateTelemetry(telemetryEnabled === 'enabled');
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

initTelemetry({
    defaultProperties,
    enabled: telemetryEnabled === 'enabled',
    instrumentationKey,
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            const request = https.request(url, { method: 'POST' }, (response) => {
                resolve(response.statusCode);
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.write(data);
            request.end();
        });
    }
});
