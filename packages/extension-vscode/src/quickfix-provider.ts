import { CodeAction, CodeActionKind, CodeActionParams, Command, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getProblemNameFromDiagnostic } from './utils/problems';

export class QuickFixActionProvider {
    private documents: TextDocuments<TextDocument>;
    private sourceName: string;

    private quickFixActionsTemplates = new Map([
        ['vscode-webhint/ignore-hint-project', (hintName: string) => {
            return `Ignore hint '${hintName}' in this project`;
        }],
        ['vscode-webhint/ignore-problem-project', (hintProblem: string) => {
            return `Ignore problem '${hintProblem}' in this project`;
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
            // only respond to requests for specified source.
            if (!currentDiagnostic.source || currentDiagnostic.source !== this.sourceName) {
                return;
            }

            this.quickFixActionsTemplates.forEach((value, key) => {
                // default title
                let title = currentDiagnostic.code?.toString() || '';

                // if it is a problem (not a hint) use the problem as a title instead
                if (key.includes('-problem-')) {
                    const problemName = getProblemNameFromDiagnostic(currentDiagnostic);

                    title = problemName ? problemName : title;
                }

                // create custom codeActions and associating custom commands.
                const customCommand: Command = { command: key, title };

                customCommand.arguments = [title, currentDiagnostic.code];
                const customCodeAction = CodeAction.create(value(title), customCommand, CodeActionKind.QuickFix);

                customCodeAction.diagnostics = [currentDiagnostic];
                results.push(customCodeAction);
            });
        });

        if (results.length > 0) {
            const editCurrentProjectConfigTitle = 'Edit .hintrc for current project';
            const editCurrentProjectConfig: Command = { command: 'vscode-webhint/edit-hintrc-project', title: editCurrentProjectConfigTitle };

            results.push(CodeAction.create(editCurrentProjectConfigTitle, editCurrentProjectConfig, CodeActionKind.QuickFix));
        }

        return results;
    }
}
