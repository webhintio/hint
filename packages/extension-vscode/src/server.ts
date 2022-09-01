import { createConnection, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { pathToFileURL } from 'node:url';

import type { Problem } from '@hint/utils-types';

import { Analyzer } from './utils/analyze';
import { QuickFixActionProvider } from './quickfix-provider';
import { WebhintConfiguratorParser } from './utils/webhint-utils';

import * as path from 'path';

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

    return {
        capabilities: {
            codeActionProvider: true,
            executeCommandProvider: {
                commands: [
                    'vscode-webhint/apply-code-fix',
                    'vscode-webhint/ignore-hint-project',
                    'vscode-webhint/ignore-axe-rule-project',
                    'vscode-webhint/ignore-browsers-project',
                    'vscode-webhint/ignore-feature-project',
                    'vscode-webhint/edit-hintrc-project'
                ]
            },
            textDocumentSync: TextDocumentSyncKind.Full
        }
    };
});

// A watched .hintrc has changed. Reload the engine and re-validate documents.
connection.onDidChangeWatchedFiles(async () => {
    analyzer.onConfigurationChanged();
    await Promise.all(documents.all().map((doc) => {
        return analyzer.validateTextDocument(doc, workspace);
    }));
});

connection.onCodeAction((params) => {
    return quickFixActionProvider.provideCodeActions(params);
});

connection.onExecuteCommand(async (params) => {
    const args = params.arguments ?? [];
    const problemName = args[0] as string;
    const hintName = args[1] as string;
    const problem = args[2] as Problem;
    const configurationParser = new WebhintConfiguratorParser();
    const configFilePath = path.join(workspace, '.hintrc');

    await configurationParser.initialize(configFilePath);

    switch (params.command) {
        case 'vscode-webhint/ignore-hint-project': {
            await configurationParser.ignoreHintPerProject(hintName);
            break;
        }
        case 'vscode-webhint/ignore-axe-rule-project': {
            await configurationParser.addAxeRuleToIgnoredHintsConfig(hintName, problemName);
            break;
        }
        case 'vscode-webhint/ignore-browsers-project': {
            await configurationParser.addBrowsersToIgnoredHintsConfig(hintName, problem);
            break;
        }
        case 'vscode-webhint/ignore-feature-project': {
            await configurationParser.addFeatureToIgnoredHintsConfig(hintName, problemName);
            break;
        }
        case 'vscode-webhint/edit-hintrc-project': {
            await connection.window.showDocument({ uri: pathToFileURL(configFilePath).toString() });
            break;
        }
        default: {
            break;
        }
    }
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
