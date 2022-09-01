import test from 'ava';
import { TextDocuments, CodeActionParams} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { QuickFixActionProvider } from '../src/quickfix-provider';
import { Problem, Severity } from '@hint/utils-types';
import { problemToDiagnostic } from '../src/utils/problems';

const mockContext = () => {
    const fakeCodeActions = {
        context: {diagnostics: []},
        textDocument: {uri: {}}
    } as unknown as CodeActionParams;
    const documents = {
        get: (uri: string) => {
            return TextDocument.create('document', 'text', 1, '');
        }
    } as unknown as TextDocuments<TextDocument>;

    return {
        documents,
        fakeCodeActions
    };
};

test('It handles an empty document', (t) => {

    const {fakeCodeActions} = mockContext();
    const quickFixActionProvider = new QuickFixActionProvider(new TextDocuments(TextDocument), 'test environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.is(results, null);
});

test('It returns null for empty diagnostics', (t) => {
    const {documents, fakeCodeActions} = mockContext();

    fakeCodeActions.context.diagnostics = [];
    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.is(results, null);
});

test('It correctly returns expected quick fixes for a single diagnostic with the right source set', (t) => {
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        hintId: 'compat-api/hint-test-1',
        location,
        message: `'fake-problem' is reported in here`,
        severity: Severity.error
    } as Problem;

    const {documents, fakeCodeActions} = mockContext();

    const currentDocument = documents.get('any');

    if (currentDocument) {
        const diagnostic = problemToDiagnostic(problem, currentDocument);

        diagnostic.source = 'test_environment';
        fakeCodeActions.context.diagnostics = [diagnostic];
    } else {
        t.fail('Expected code actions but none received');
    }

    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test_environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.not(results, null);
    t.is(results?.length, 3);

    if (results){
        t.is(results[0].title.includes('fake-problem'), true);
        t.is(results[1].title.includes('hint-test-1'), true);
        t.is(results[2].title, 'Edit .hintrc for current project');
    } else {
        t.fail('Expected code actions but none received');
    }
});

test('It correctly returns expected quick fixes for a several diagnostic with the right source set', (t) => {
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        hintId: 'compat-api/hint-test-1',
        location,
        message: `'fake-problem' is reported in here`,
        severity: Severity.error
    } as Problem;

    const problem2 = {
        hintId: 'compat-api/hint-test-2',
        location,
        message: `just changing the 'second-fake-problem' order to keep it 'interesting'`,
        severity: Severity.error
    } as Problem;


    const {documents, fakeCodeActions} = mockContext();

    const currentDocument = documents.get('any');

    if (currentDocument) {
        const diagnostic = problemToDiagnostic(problem, currentDocument);
        const diagnostic2 = problemToDiagnostic(problem2, currentDocument);

        diagnostic.source = 'test_environment';
        diagnostic2.source = 'test_environment';
        fakeCodeActions.context.diagnostics = [diagnostic, diagnostic2];
    } else {
        t.fail('Expected code actions but none received');
    }

    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test_environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.not(results, null);
    t.is(results?.length, 5);

    if (results){
        t.is(results[0].title.includes('fake-problem'), true);
        t.is(results[1].title.includes('second-fake-problem'), true);
        t.is(results[2].title.includes('hint-test-1'), true);
        t.is(results[3].title.includes('hint-test-2'), true);
        t.is(results[4].title, 'Edit .hintrc for current project');
    } else {
        t.fail('Expected code actions but none received');
    }
});

test('It correctly filters messages with the wrong source set', (t) => {
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        hintId: 'hint-test-1',
        location,
        message: `'fake-problem' is reported in here`,
        severity: Severity.error
    } as Problem;

    const {documents, fakeCodeActions} = mockContext();

    const currentDocument = documents.get('any');

    if (currentDocument) {
        const diagnostic = problemToDiagnostic(problem, currentDocument);

        diagnostic.source = 'wrong_environment';
        fakeCodeActions.context.diagnostics = [diagnostic];
    } else {
        t.fail('Expected code actions but none received');
    }

    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test_environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.is(results, null);
});

test('It correctly returns expected quick fixes for ignoring axe-core rules', (t) => {
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        documentation: [
            {
                link: 'https://dequeuniversity.com/rules/axe/4.4/html-has-lang?application=axeAPI',
                text: 'learn more'
            }
        ],
        hintId: 'axe/language',
        location,
        message: `'fake-problem' is reported in here`,
        severity: Severity.error
    } as Problem;

    const {documents, fakeCodeActions} = mockContext();

    const currentDocument = documents.get('any');

    if (currentDocument) {
        const diagnostic = problemToDiagnostic(problem, currentDocument);

        diagnostic.source = 'test_environment';
        fakeCodeActions.context.diagnostics = [diagnostic];
    } else {
        t.fail('Expected code actions but none received');
    }

    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test_environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.not(results, null);
    t.is(results?.length, 3);

    if (results){
        t.is(results[0].title.includes('html-has-lang'), true);
        t.is(results[1].title.includes('axe/language'), true);
        t.is(results[2].title, 'Edit .hintrc for current project');
    } else {
        t.fail('Expected code actions but none received');
    }
});

test('It correctly returns expected quick fixes for ignoring browsers', (t) => {
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        browsers: ['ie 9', 'ie 10'],
        hintId: 'test-hint',
        location,
        message: `'fake-problem' is not supported by Internet Explorer < 11.`,
        severity: Severity.error
    } as Problem;

    const {documents, fakeCodeActions} = mockContext();

    const currentDocument = documents.get('any');

    if (currentDocument) {
        const diagnostic = problemToDiagnostic(problem, currentDocument);

        diagnostic.source = 'test_environment';
        fakeCodeActions.context.diagnostics = [diagnostic];
    } else {
        t.fail('Expected code actions but none received');
    }

    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test_environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.not(results, null);

    if (results) {
        t.is(results[0].title.includes('Internet Explorer < 11'), true);
    } else {
        t.fail('Expected code actions but none received');
    }
});

test('It correctly returns an edit for issue with a fix', (t) => {
    const location = {
        column: 5,
        endColumn: 10,
        endLine: 8,
        line: 7
    };

    const problem = {
        fixes: [
            {
                location: {
                    column: 0,
                    endColumn: 0,
                    endLine: 0,
                    line: 0
                },
                text: 'fixed!'
            }
        ],
        hintId: 'test-hint',
        location,
        message: `'fake-problem' is reported in here`,
        resource: 'test.html',
        severity: Severity.error
    } as Problem;

    const {documents, fakeCodeActions} = mockContext();

    const currentDocument = documents.get('any');

    if (currentDocument) {
        const diagnostic = problemToDiagnostic(problem, currentDocument);

        diagnostic.source = 'test_environment';
        fakeCodeActions.context.diagnostics = [diagnostic];
    } else {
        t.fail('Expected code actions but none received');
    }

    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test_environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.not(results, null);

    t.is(results?.[0].command?.command, 'vscode-webhint/apply-code-fix');

    t.deepEqual(results?.[0].edit, {
        changes: {
            'test.html': [{
                newText: 'fixed!',
                range: {
                    end: {
                        character: 0,
                        line: 0
                    },
                    start: {
                        character: 0,
                        line: 0
                    }
                }
            }]
        }
    });
});
