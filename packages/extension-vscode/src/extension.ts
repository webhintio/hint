import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';

import * as notifications from './notifications';

// List of document types the extension will run against.
const supportedDocuments = [
    'css',
    'html',
    'javascript',
    'json',
    'jsonc'
];

// Keep a reference to the client to stop it when deactivating.
let client: LanguageClient;

export const activate = (context: ExtensionContext) => {

    const serverModule = context.asAbsolutePath('dist/src/server.js');

    const serverOptions: ServerOptions = {
        debug: {
            module: serverModule,
            options: { execArgv: ['--nolazy', '--inspect=6009'] },
            transport: TransportKind.ipc
        },
        run: {
            module: serverModule,
            transport: TransportKind.ipc
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: supportedDocuments,
        synchronize: {
            // Notify the server if a webhint-related configuration changes.
            fileEvents: workspace.createFileSystemWatcher('**/.hintrc')
        }
    };

    // Create and start the client (also starts the server).
    client = new LanguageClient('webhint', serverOptions, clientOptions);

    client.onReady().then(() => {

        // Listen for requests to show the output panel for this extension.
        client.onNotification(notifications.showOutput, () => {
            client.outputChannel.clear();
            client.outputChannel.show(true);
        });
    });

    client.start();
};

export const deactivate = (): Thenable<void> => {
    return client && client.stop();
};
