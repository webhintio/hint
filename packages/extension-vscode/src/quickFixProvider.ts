import { CodeAction, CodeActionKind, CodeActionParams, Command, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export class QuickFixActionProvider {
    private documents: TextDocuments<TextDocument>;
    private sourceName: string;

    private quickFixActionsTemplates = new Map([
        ['vscode-webhint/ignore-category-project', (category: string) => {
            return `Ignore '${category}' in this project`;
        }],
        ['vscode-webhint/ignore-category-global', (category: string) => {
            return `Ignore '${category}' in all projects`;
        }],
        ['vscode-webhint/ignore-hint-project', (name: string) => {
            return `Ignore rule'${name}' in this project`;
        }],
        ['vscode-webhint/ignore-hint-global', (name: string) => {
            return `Ignore rule '${name}' in this project`;
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

                const customCommand: Command = { command: key, title: value(`${currentDiagnostic.code}` || currentDiagnostic.message) };

                customCommand.arguments = [currentDiagnostic, textDocument];
                const customCodeAction = CodeAction.create(value(`${currentDiagnostic.code}` || currentDiagnostic.message), customCommand, CodeActionKind.QuickFix);

                customCodeAction.diagnostics = [currentDiagnostic];
                results.push(customCodeAction);
            });
        });

        results.push(CodeAction.create('Edit .hintrc for current project', CodeActionKind.QuickFix));
        results.push(CodeAction.create('Edit .hintrc for all projects', CodeActionKind.QuickFix));

        return results;
    }
}
