import { window, workspace, ExtensionContext, Memento, WorkspaceConfiguration } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';

import { TelemetryState } from './utils/analytics';
import * as notifications from './utils/notifications';

const { activationEvents } = require('../../package.json');

const telemetryKey = 'enableTelemetry';
const everEnabledTelemetryKey = 'everEnabledTelemetry';

// List of document types the extension will run against.
const supportedDocuments = activationEvents.map((event: string) => {
    return event.split(':')[1];
});

// Keep a reference to the client to stop it when deactivating.
let client: LanguageClient;

const configureTelemetry = (config: WorkspaceConfiguration, enableTelemetry: TelemetryState) => {
    config.update(telemetryKey, enableTelemetry, true);
    client.sendNotification(notifications.telemetryEnabledChanged, enableTelemetry);
};

/* istanbul ignore next */
const showTelemetryMessage = async (config: WorkspaceConfiguration, enableTelemetry: TelemetryState, state: Memento) => {
    if (enableTelemetry !== 'ask') {
        if (enableTelemetry === 'enabled') {
            state.update(everEnabledTelemetryKey, true);
        }

        return;
    }

    const yesResponse = 'Enable telemetry';
    const noResponse = 'No thanks';
    const answer = await window.showInformationMessage(
        'Help us improve webhint by sending [limited usage information](https://webhint.io/docs/user-guide/telemetry/summary/) (no personal information or URLs will be sent).',
        { title: yesResponse },
        { title: noResponse }
    );

    if (answer && answer.title === yesResponse) {
        configureTelemetry(config, 'enabled');
        state.update(everEnabledTelemetryKey, true);
    } else if (answer && answer.title === noResponse) {
        configureTelemetry(config, 'disabled');
    }
};

export const activate = (context: ExtensionContext) => {
    const config = workspace.getConfiguration('webhint', null);
    const everEnabledTelemetry = context.globalState.get<boolean>(everEnabledTelemetryKey, false);
    const enableTelemetry: TelemetryState = config.get('enableTelemetry') || 'ask';
    const args = [context.globalStoragePath, enableTelemetry, `${everEnabledTelemetry}`];
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
        showTelemetryMessage(config, enableTelemetry, context.globalState);

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
