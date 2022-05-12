import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';
import { TextDocuments, CodeActionParams} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { QuickFixActionProvider } from '../src/quickFixProvider';
import { Problem, Severity } from '@hint/utils-types';
import { problemToDiagnostic } from '../src/utils/problems';

type SandboxContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestFn<SandboxContext>;
const mockContext = (context: SandboxContext) => {
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

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});


test.only('It handles an empty document', (t) => {

    const {fakeCodeActions} = mockContext(t.context);
    const quickFixActionProvider = new QuickFixActionProvider(new TextDocuments(TextDocument), 'test environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.is(results, null);
});

test.only('It returns only two elements with empty diagnostics', (t) => {
    const {documents, fakeCodeActions} = mockContext(t.context);

    fakeCodeActions.context.diagnostics = [];
    const quickFixActionProvider = new QuickFixActionProvider(documents, 'test environment');

    const results = quickFixActionProvider.provideCodeActions(fakeCodeActions);

    t.not(results, null);
    t.is(results?.length, 2);

    if (results){
        t.is(results[0].title, 'Edit .hintrc for current project');
        t.is(results[1].title, 'Edit .hintrc for all projects');
    } else {
        t.fail('Expected code actions but none received');
    }
});

test.only('It correctly returns expected quick fixes for a single diagnostic with the right source set', (t) => {
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

    const {documents, fakeCodeActions} = mockContext(t.context);

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
    t.is(results?.length, 6);

    if (results){
        t.is(results[0].title.includes('hint-test-1'), true);
        t.is(results[1].title.includes('hint-test-1'), true);
        t.is(results[2].title.includes('fake-problem'), true);
        t.is(results[3].title.includes('fake-problem'), true);
        t.is(results[4].title, 'Edit .hintrc for current project');
        t.is(results[5].title, 'Edit .hintrc for all projects');
    } else {
        t.fail('Expected code actions but none received');
    }
});

test.only('It correctly returns expected quick fixes for a several diagnostic with the right source set', (t) => {
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

    const problem2 = {
        hintId: 'hint-test-2',
        location,
        message: `just changing the 'second-fake-problem' order to keep it 'interesting'`,
        severity: Severity.error
    } as Problem;


    const {documents, fakeCodeActions} = mockContext(t.context);

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
    t.is(results?.length, 10);

    if (results){
        t.is(results[0].title.includes('hint-test-1'), true);
        t.is(results[1].title.includes('hint-test-1'), true);
        t.is(results[2].title.includes('fake-problem'), true);
        t.is(results[3].title.includes('fake-problem'), true);
        t.is(results[4].title.includes('hint-test-2'), true);
        t.is(results[5].title.includes('hint-test-2'), true);
        t.is(results[6].title.includes('second-fake-problem'), true);
        t.is(results[7].title.includes('second-fake-problem'), true);
        t.is(results[8].title, 'Edit .hintrc for current project');
        t.is(results[9].title, 'Edit .hintrc for all projects');
    } else {
        t.fail('Expected code actions but none received');
    }
});

test.only('It correctly filters messages with the wrong source set', (t) => {
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

    const {documents, fakeCodeActions} = mockContext(t.context);

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

    t.not(results, null);
    t.is(results?.length, 2);

    if (results){
        t.is(results[0].title, 'Edit .hintrc for current project');
        t.is(results[1].title, 'Edit .hintrc for all projects');
    } else {
        t.fail('Expected code actions but none received');
    }
});
