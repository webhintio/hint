import { CodeAction, CodeActionKind, CodeActionParams, Command, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getProblemNameFromDiagnostic } from './utils/problems';

export class QuickFixActionProvider {
    private documents: TextDocuments<TextDocument>;
    private sourceName: string;

    private quickFixActionsTemplates = new Map([
        ['vscode-webhint/ignore-hint-project', (category: string) => {
            return `Ignore hint '${category}' in this project`;
        }],
        ['vscode-webhint/ignore-hint-global', (category: string) => {
            return `Ignore hint '${category}' in all projects`;
        }],
        ['vscode-webhint/ignore-problem-project', (name: string) => {
            return `Ignore problem '${name}' in this project`;
        }],
        ['vscode-webhint/ignore-problem-global', (name: string) => {
            return `Ignore problem '${name}' in all projects`;
        }]
    ]);

    public constructor(documents: TextDocuments<TextDocument>, sourceName: string) {
        this.documents = documents;
        this.sourceName = sourceName;
    }

    public provideCodeActions(params: CodeActionParams): CodeAction[] | null {
        const textDocument = this.documents.get(params.textDocument.uri);

        if (!textDocument) {
            return null;
        }

        const results: CodeAction[] = [];

        params.context.diagnostics.forEach((currentDiagnostic) => {
            this.quickFixActionsTemplates.forEach((value, key) => {

                // only respond to Microsoft Edge Tools requests.
                if (!currentDiagnostic.source || currentDiagnostic.source !== this.sourceName) {
                    return;
                }

                let title = currentDiagnostic.code?.toString() || '';

                if (key.includes('-problem-')) {
                    const problemName = getProblemNameFromDiagnostic(currentDiagnostic);

                    title = problemName ? problemName : title;
                }

                const customCommand: Command = { command: key, title };

                customCommand.arguments = [currentDiagnostic, title, currentDiagnostic.code];
                const customCodeAction = CodeAction.create(value(title), customCommand, CodeActionKind.QuickFix);

                customCodeAction.diagnostics = [currentDiagnostic];
                results.push(customCodeAction);
            });
        });

        const editCurrentProjectConfigTitle = 'Edit .hintrc for current project';
        const editGlobalProjectConfigTitle = 'Edit .hintrc for all projects';
        const editCurrentProjectConfig: Command = { command: 'vscode-webhint/edit-hintrc-project', title: editCurrentProjectConfigTitle };
        const editGlobalProjectConfig: Command = { command: 'vscode-webhint/edit-hintrc-global', title: editGlobalProjectConfigTitle };

        results.push(CodeAction.create(editCurrentProjectConfigTitle, editCurrentProjectConfig, CodeActionKind.QuickFix));
        results.push(CodeAction.create(editGlobalProjectConfigTitle, editGlobalProjectConfig, CodeActionKind.QuickFix));

        return results;
    }
}
