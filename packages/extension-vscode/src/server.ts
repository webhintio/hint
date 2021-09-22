import * as https from 'https';
import { createConnection, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { initTelemetry, updateTelemetry } from '@hint/utils-telemetry';

import { trackClose, trackSave, trackOptIn, TelemetryState } from './utils/analytics';
import { Analyzer } from './utils/analyze';
import * as notifications from './utils/notifications';

// Look two-levels up for `package.json` as this will be in `dist/src/` post-build.
const { version } = require('../../package.json');

const defaultProperties = { 'extension-version': version };

const [,, globalStoragePath, telemetryEnabled, everEnabledTelemetryStr] = process.argv;
const everEnabledTelemetry = everEnabledTelemetryStr === 'true';
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

connection.onNotification(notifications.telemetryEnabledChanged, (telemetryEnabled: TelemetryState) => {
    updateTelemetry(telemetryEnabled === 'enabled');
    trackOptIn(telemetryEnabled, everEnabledTelemetry);
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
    trackSave(document.uri, document.languageId);
});

// Listen on the text document manager and connection.
documents.listen(connection);
connection.listen();

initTelemetry({
    defaultProperties,
    enabled: telemetryEnabled === 'enabled',
    post: (url, data) => {
        return new Promise<number>((resolve, reject) => {
            const request = https.request(url, { method: 'POST' }, (response) => {
                resolve(response.statusCode as number);
            });

            request.on('error', (err) => {
                reject(err);
            });

            /*
             * Don't use request.write or request will be sent chunked.
             * Chunked requests break in node-based v2 Azure Functions,
             * which are used to run the webhint telemetry service.
             * https://github.com/Azure/azure-functions-host/issues/4926
             */
            request.end(data);
        });
    }
});

// Handle telemetry opt-in via direct changes to settings between launches.
trackOptIn(telemetryEnabled as TelemetryState, everEnabledTelemetry);
