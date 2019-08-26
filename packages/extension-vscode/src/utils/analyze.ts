import { URL } from 'url';
import { TextDocument, PublishDiagnosticsParams, Connection } from 'vscode-languageserver';

import { trackResult } from './analytics';
import { getUserConfig } from './config';
import * as notifications from './notifications';
import { loadWebhint, updateSharedWebhint } from './webhint-packages';
import { problemToDiagnostic } from './problems';
import { promptAddWebhint, promptRetry } from './prompts';

const analyze = async (uri: string, content: string, webhint: import('hint').Analyzer): Promise<PublishDiagnosticsParams> => {
    // In VSCode on Windows, the `:` is escaped after the drive letter in `textDocument.uri`.
    const url = new URL(unescape(uri));

    // Pass content directly to validate unsaved changes.
    const results = await webhint.analyze({ content, url });

    trackResult(uri, {
        hints: webhint.resources.hints,
        problems: results.length > 0 ? results[0].problems : []
    });

    return {
        diagnostics: results.length > 0 ? results[0].problems.map(problemToDiagnostic) : [],
        uri
    };
};

export class Analyzer {
    private connection: Connection;
    private globalStoragePath: string;
    private loaded = false;
    private validating = false;
    private validationQueue: TextDocument[] = [];
    private webhint: import('hint').Analyzer | null = null;

    public constructor(_globalStoragePath: string, _connection: Connection) {
        this.connection = _connection;
        this.globalStoragePath = _globalStoragePath;
    }

    // Load both webhint and a configuration, adjusting it as needed for this extension.
    private async initWebhint(directory: string): Promise<import('hint').Analyzer | null> {
        const hintModule = await loadWebhint(directory, this.globalStoragePath, (install) => {
            return promptAddWebhint(this.connection.window, async () => {
                this.connection.sendNotification(notifications.showOutput);
                await install();
            });
        });

        // If no module was returned, the user cancelled installing webhint.
        if (!hintModule) {
            return null;
        }

        const userConfig = getUserConfig(hintModule, directory);

        try {
            return hintModule.createAnalyzer(userConfig);
        } catch (e) {
            // Instantiating webhint failed, log the error to the webhint output panel to aid debugging.
            console.error(e);

            return await promptRetry(this.connection.window, () => {
                this.connection.sendNotification(notifications.showOutput);

                return this.initWebhint(directory);
            });
        } finally {
            /*
             * Ensure shared copy of webhint is up-to-date for next use.
             * Done after attempting to load webhint to avoid delaying startup.
             */
            updateSharedWebhint(this.globalStoragePath);
        }
    }

    // Queue a document to validate later (if needed). Returns `true` if queued.
    private queueValidationIfNeeded(textDocument: TextDocument): boolean {
        if (!this.validating) {
            return false;
        }

        // Drop stale queued validations for the same document.
        this.validationQueue = this.validationQueue.filter((doc) => {
            return doc.uri !== textDocument.uri;
        });

        // Queue this document to be validated.
        this.validationQueue.push(textDocument);

        // Wait for the current validation to finish.
        return true;
    }

    public onConfigurationChanged() {
        this.loaded = false;
        this.webhint = null;
    }

    public async validateTextDocument(textDocument: TextDocument, directory: string): Promise<void> {
        // Wait if another doc is validating to avoid interleaving errors.
        if (this.queueValidationIfNeeded(textDocument)) {
            return;
        }

        try {
            this.validating = true;

            // Try to load webhint if this is the first validation.
            if (!this.loaded) {
                this.loaded = true;
                this.webhint = await this.initWebhint(directory);
            }

            // Gracefully exit if all attempts to get an engine failed.
            if (!this.webhint) {
                return;
            }

            const diagnostics = await analyze(textDocument.uri, textDocument.getText(), this.webhint);

            this.connection.sendDiagnostics(diagnostics);

        } finally {
            this.validating = false;

            // Validate any documents queued during validation.
            const nextDocument = this.validationQueue.shift();

            if (nextDocument) {
                await this.validateTextDocument(nextDocument, directory);
            }
        }
    }
}
