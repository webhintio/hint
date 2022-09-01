import { CodeAction, CodeActionKind, CodeActionParams, Command, Diagnostic, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import type { Problem } from '@hint/utils-types';

import { getFeatureNameFromDiagnostic, WebhintDiagnosticData } from './utils/problems';

export class QuickFixActionProvider {
    private documents: TextDocuments<TextDocument>;
    private sourceName: string;

    public constructor(documents: TextDocuments<TextDocument>, sourceName: string) {
        this.documents = documents;
        this.sourceName = sourceName;
    }

    private createCodeFixAction(hintName: string, diagnostic: Diagnostic, problem: Problem): CodeAction {
        if (!problem.fixes) {
            throw new Error('Unable to determine which fixes to apply');
        }

        const action = CodeAction.create(
            `Fix '${hintName}' issue`,
            {
                arguments: [hintName, hintName],
                command: 'vscode-webhint/apply-code-fix',
                title: hintName
            },
            CodeActionKind.QuickFix
        );

        action.diagnostics = [diagnostic];

        action.edit = {
            changes: {
                [problem.resource]: problem.fixes.map((fix) => {
                    return {
                        newText: fix.text,
                        range: {
                            end: {
                                character: fix.location.endColumn ?? 0,
                                line: fix.location.endLine ?? 0
                            },
                            start: {
                                character: fix.location.column,
                                line: fix.location.line
                            }
                        }
                    };
                })
            }
        };

        return action;
    }

    private createIgnoreAxeRuleAction(hintName: string, diagnostic: Diagnostic): CodeAction {
        const command = 'vscode-webhint/ignore-axe-rule-project';
        const url = diagnostic.codeDescription?.href;
        const ruleName = url && url.substring(url.lastIndexOf('/') + 1, url.indexOf('?'));

        /* istanbul ignore next */
        if (!ruleName) {
            throw new Error('Unable to determine which axe-core rule to ignore');
        }

        const action = CodeAction.create(
            `Ignore '${ruleName}' accessibility in this project`,
            {
                arguments: [ruleName, hintName],
                command,
                title: ruleName
            },
            CodeActionKind.QuickFix
        );

        /*
         * TODO: link to diagnostic once https://github.com/microsoft/vscode/issues/126393 is fixed
         * action.diagnostics = [diagnostic];
         */
        return action;
    }

    private createIgnoreBrowsersAction(hintName: string, diagnostic: Diagnostic, problem: Problem): CodeAction {
        const command = 'vscode-webhint/ignore-browsers-project';
        const browsers = problem.browsers;

        // TODO: Consider passing the friendly browser names in the problem to avoid i18n issues.
        const [, firstBrowser, separator] = diagnostic.message.match(/ by (.+?)(,|\. |\.$)/) || [];
        const hasMore = separator === ',';

        /* istanbul ignore next */
        if (!browsers || !firstBrowser) {
            throw new Error('Unable to determine which browsers to ignore');
        }

        const action = CodeAction.create(
            `Ignore '${firstBrowser}${hasMore ? ', \u2026' : ''}' compatibility in this project`,
            {
                arguments: ['browsers', hintName, problem],
                command,
                title: 'browsers'
            },
            CodeActionKind.QuickFix
        );

        /*
         * TODO: link to diagnostic once https://github.com/microsoft/vscode/issues/126393 is fixed
         * action.diagnostics = [diagnostic];
         */

        return action;
    }

    private createIgnoreFeatureAction(hintName: string, diagnostic: Diagnostic): CodeAction {
        const command = 'vscode-webhint/ignore-feature-project';
        const featureName = getFeatureNameFromDiagnostic(diagnostic);

        /* istanbul ignore next */
        if (!featureName) {
            throw new Error('Unable to determine which HTML/CSS feature to ignore');
        }

        const action = CodeAction.create(
            `Ignore '${featureName}' compatibility in this project`,
            {
                arguments: [featureName, hintName],
                command,
                title: featureName
            },
            CodeActionKind.QuickFix
        );

        /*
         * TODO: link to diagnostic once https://github.com/microsoft/vscode/issues/126393 is fixed
         * action.diagnostics = [diagnostic];
         */

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

        /*
         * TODO: link to diagnostic once https://github.com/microsoft/vscode/issues/126393 is fixed
         * action.diagnostics = [diagnostic];
         */

        return action;
    }

    public provideCodeActions(params: CodeActionParams): CodeAction[] | null {
        const textDocument = this.documents.get(params.textDocument.uri);

        if (!textDocument) {
            return null;
        }

        const webhintDiagnostics = params.context.diagnostics.filter((diagnostic) => {
            return diagnostic.data && diagnostic.source && diagnostic.source === this.sourceName;
        });

        if (webhintDiagnostics.length === 0) {
            return null;
        }

        const results: CodeAction[] = [];

        // First add options to ignore reported diagnostics (if available).
        webhintDiagnostics.forEach((diagnostic) => {
            const hintName = `${diagnostic.code}`;
            const data = diagnostic.data as WebhintDiagnosticData;

            if (data.problem.fixes?.length) {
                results.push(this.createCodeFixAction(hintName, diagnostic, data.problem));
            }

            if (hintName.startsWith('axe/')) {
                results.push(this.createIgnoreAxeRuleAction(hintName, diagnostic));
            }
            if (hintName.startsWith('compat-api/')) {
                results.push(this.createIgnoreFeatureAction(hintName, diagnostic));
            }
            if (data.problem.browsers) {
                results.push(this.createIgnoreBrowsersAction(hintName, diagnostic, data.problem));
            }
        });

        // Then add options to disable the hints that reported the diagnostics.
        webhintDiagnostics.forEach((diagnostic) => {
            results.push(this.createIgnoreHintAction(`${diagnostic.code}`, diagnostic));
        });

        // Finally, add a shortcut to edit the .hintrc file.
        const editCurrentProjectConfigTitle = 'Edit .hintrc for current project';
        const editCurrentProjectConfig: Command = { command: 'vscode-webhint/edit-hintrc-project', title: editCurrentProjectConfigTitle };

        results.push(CodeAction.create(editCurrentProjectConfigTitle, editCurrentProjectConfig, CodeActionKind.QuickFix));

        return results;
    }
}
