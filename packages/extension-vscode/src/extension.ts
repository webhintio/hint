import { window, workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

import * as notifications from './utils/notifications';

// Look two-levels up for `package.json` as this will be in `dist/src/` post-build.
const { activationEvents } = require('../../package.json');

// List of document types the extension will run against.
const supportedDocuments = activationEvents.map((event: string) => {
    return event.split(':')[1];
});

// Keep a reference to the client to stop it when deactivating.
let client: LanguageClient;

export const activate = (context: ExtensionContext) => {
    const args = [context.globalStoragePath, 'webhint'];
    const module = context.asAbsolutePath('dist/src/server.js');
    const transport = TransportKind.ipc;

    const serverOptions: ServerOptions = {
        debug: {
            args,
            module,
            options: { execArgv: ['--nolazy', '--inspect=6009'] },
            transport
        },
        run: {
            args,
            module,
            transport
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
        // Listen for notification that the webhint install failed.
        client.onNotification(notifications.installFailed, () => {
            const message = 'Ensure `node` and `npm` are installed to enable webhint to analyze source files.';

            window.showInformationMessage(message, 'OK');
        });
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
