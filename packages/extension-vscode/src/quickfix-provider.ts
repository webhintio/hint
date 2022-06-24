import { CodeAction, CodeActionKind, CodeActionParams, Command, Diagnostic, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getProblemNameFromDiagnostic as getFeatureNameFromDiagnostic } from './utils/problems';

export class QuickFixActionProvider {
    private documents: TextDocuments<TextDocument>;
    private sourceName: string;

    public constructor(documents: TextDocuments<TextDocument>, sourceName: string) {
        this.documents = documents;
        this.sourceName = sourceName;
    }

    private createIgnoreFeatureAction(hintName: string, diagnostic: Diagnostic): CodeAction {
        const command = 'vscode-webhint/ignore-feature-project';
        const featureName = getFeatureNameFromDiagnostic(diagnostic);

        if (!featureName) {
            throw new Error('Unable to determine which HTML/CSS feature to ignore');
        }

        const action = CodeAction.create(
            `Ignore '${featureName}' in this project`,
            {
                arguments: [featureName, hintName],
                command,
                title: featureName
            },
            CodeActionKind.QuickFix
        );

        action.diagnostics = [diagnostic];

        return action;
    }

    private createIgnoreHintAction(hintName: string, diagnostic: Diagnostic): CodeAction {
        const command = 'vscode-webhint/ignore-hint-project';
        const action = CodeAction.create(
            `Disable '${hintName}' hints in this project`,
            {
                arguments: [hintName, hintName],
                command,
                title: hintName
            },
            CodeActionKind.QuickFix
        );

        action.diagnostics = [diagnostic];

        return action;
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

            const hintName = `${currentDiagnostic.code}`;

            if (hintName.startsWith('compat-api/')) {
                // Prefer ignoring specific HTML/CSS features when possible.
                results.push(this.createIgnoreFeatureAction(hintName, currentDiagnostic));
            }

            // Offer to disable the entire hint.
            results.push(this.createIgnoreHintAction(hintName, currentDiagnostic));
        });

        if (results.length > 0) {
            const editCurrentProjectConfigTitle = 'Edit .hintrc for current project';
            const editCurrentProjectConfig: Command = { command: 'vscode-webhint/edit-hintrc-project', title: editCurrentProjectConfigTitle };

            results.push(CodeAction.create(editCurrentProjectConfigTitle, editCurrentProjectConfig, CodeActionKind.QuickFix));
        }

        return results;
    }
}
