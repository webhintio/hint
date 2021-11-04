import { URL } from 'url';
import { PublishDiagnosticsParams, Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { getUserConfig } from './config';
import * as notifications from './notifications';
import { loadWebhint } from './webhint-packages';
import { problemToDiagnostic } from './problems';
import { promptRetry } from './prompts';
import { Problem } from '@hint/utils-types';

const analyze = async (textDocument: TextDocument, webhint: import('hint').Analyzer): Promise<PublishDiagnosticsParams> => {
    const { uri } = textDocument;
    const content = textDocument.getText();

    // In VSCode on Windows, the `:` is escaped after the drive letter in `textDocument.uri`.
    const url = new URL(unescape(uri));

    // Pass content directly to validate unsaved changes.
    const results = await webhint.analyze({ content, url });

    return {
        diagnostics: results.length > 0 ? results[0].problems.map((problem: Problem) => {
            return problemToDiagnostic(problem, textDocument);
        }) : [],
        uri
    };
};

export class Analyzer {
    private connection: Connection;
    private globalStoragePath: string;
    private loaded = false;
    private sourceName: string;
    private validating = false;
    private validationQueue: TextDocument[] = [];
    private webhint: import('hint').Analyzer | null = null;

    public constructor(_globalStoragePath: string, _connection: Connection, _sourceName: string) {
        this.connection = _connection;
        this.globalStoragePath = _globalStoragePath;
        this.sourceName = _sourceName;
    }

    /**
     * Load both webhint and a configuration, adjusting it as needed for this extension.
     * If `directory` is not passed, the shared installation will be used.
     */
    private async initWebhint(directory = ''): Promise<import('hint').Analyzer | null> {
        const hintModule = await loadWebhint(directory, this.globalStoragePath);

        /* istanbul ignore if */
        if (!hintModule) {
            this.connection.sendNotification(notifications.installFailed);

            return null;
        }

        try {
            const userConfig = getUserConfig(hintModule, directory);

            return hintModule.createAnalyzer(userConfig);
        } catch (e) {
            // Instantiating webhint failed, log the error to the webhint output panel to aid debugging.
            console.error(e);

            return await promptRetry(this.connection.window, /* istanbul ignore next */() => {
                this.connection.sendNotification(notifications.showOutput);

                // We retry with the shared version as it is more likely to not be broken 🤞
                return this.initWebhint();
            });
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

            const diagnostics = await analyze(textDocument, this.webhint);

            diagnostics.diagnostics.forEach((d) => {
                d.source = this.sourceName;
            });
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
