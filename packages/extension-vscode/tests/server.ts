import * as mock from './fixtures/mocks';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { Problem, Severity } from 'hint/dist/src/lib/types';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';

proxyquire('../src/server', {
    child_process: mock.child_process, // eslint-disable-line
    'vscode-languageserver': {
        createConnection: mock.createConnection,
        Files: mock.Files,
        ProposedFeatures: mock.ProposedFeatures,
        TextDocuments: mock.TextDocuments
    }
});

import '../src/server';

test.beforeEach((t) => {
    t.context.connection = mock.connection;
    t.context.engine = mock.engine;
    t.context.child_process = mock.child_process; // eslint-disable-line
    t.context.Files = mock.Files;
});

test.serial('It notifies if loading webhint fails', async (t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });

    sandbox.stub(mock.connection.window, 'showWarningMessage').returns({ title: 'Cancel' });
    sandbox.stub(mock.Files, 'resolveModule2').throws();
    sandbox.spy(mock.engine, 'executeOn');

    await mock.initializer({ rootPath: '' });
    await mock.contentWatcher({ document: mock.document });

    t.true(t.context.connection.window.showWarningMessage.calledOnce);
    t.false(t.context.engine.executeOn.called);

    sandbox.restore();
});

test.serial('It installs webhint if needed', async (t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });

    sandbox.stub(mock.connection.window, 'showWarningMessage').returns({ title: 'Add webhint' });

    sandbox.stub(mock.Files, 'resolveModule2')
        .onFirstCall()
        .throws();

    sandbox.spy(mock.child_process, 'exec');
    sandbox.spy(mock.engine, 'executeOn');

    await mock.initializer({ rootPath: '' });
    await mock.contentWatcher({ document: mock.document });

    t.true(t.context.connection.window.showWarningMessage.calledOnce);
    t.true(t.context.child_process.exec.calledOnce);
    t.is(t.context.child_process.exec.args[0][0], 'npm install hint @hint/configuration-development --save-dev');
    t.false(t.context.engine.executeOn.called);

    sandbox.restore();
});

test.serial('It notifies if loading the configuration fails', async (t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });

    sandbox.stub(mock.connection.window, 'showErrorMessage').returns({ title: 'Ignore' });
    sandbox.stub(mock.Configuration, 'fromConfig').throws();
    sandbox.spy(mock.engine, 'executeOn');

    await mock.initializer({ rootPath: '' });
    await mock.contentWatcher({ document: mock.document });

    t.true(t.context.connection.window.showErrorMessage.calledOnce);
    t.false(t.context.engine.executeOn.called);

    sandbox.restore();
});

test.serial('It loads a local copy of webhint', async (t) => {
    const testPath = '/test/path';
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });

    sandbox.spy(mock.connection.window, 'showWarningMessage');
    sandbox.spy(mock.Files, 'resolveModule2');

    await mock.initializer({ rootPath: testPath });
    await mock.contentWatcher({ document: mock.document });

    t.is(t.context.Files.resolveModule2.args[0][0], testPath);
    t.false(t.context.connection.window.showWarningMessage.called);

    sandbox.restore();
});

test.serial('It runs webhint on content changes', async (t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });
    sandbox.spy(mock.engine, 'executeOn');

    await mock.contentWatcher({ document: mock.document });

    t.true(t.context.engine.executeOn.calledOnce);
    t.is(t.context.engine.executeOn.args[0][0].href, testUri);
    t.is(t.context.engine.executeOn.args[0][1].content, testContent);

    sandbox.restore();
});

test.serial('It processes multiple files serially', async (t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    const document2 = {
        getText() {
            return 'Test Content 2';
        },
        get uri() {
            return 'file:///test/uri2';
        }
    } as TextDocument;

    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });
    sandbox.spy(mock.engine, 'executeOn');

    const p1 = mock.contentWatcher({ document: mock.document });
    const p2 = mock.contentWatcher({ document: document2 });

    sandbox.stub(mock.connection, 'sendDiagnostics').value(() => {
        t.true(t.context.engine.executeOn.calledOnce);
        t.is(t.context.engine.executeOn.args[0][0].href, testUri);
        t.is(t.context.engine.executeOn.args[0][1].content, testContent);

        sandbox.stub(mock.connection, 'sendDiagnostics').value(() => {
            t.is(t.context.engine.executeOn.args[1][0].href, document2.uri);
            t.is(t.context.engine.executeOn.args[1][1].content, document2.getText());
        });
    });

    await Promise.all([p1, p2]);

    sandbox.restore();
});

test.serial('It reloads and runs webhint on watched file changes', async(t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';

    sandbox.stub(mock.documents, 'all').returns([mock.document]);
    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });
    sandbox.spy(mock.engine, 'executeOn');

    await mock.fileWatcher();

    t.true(t.context.engine.executeOn.calledOnce);
    t.is(t.context.engine.executeOn.args[0][0].href, testUri);
    t.is(t.context.engine.executeOn.args[0][1].content, testContent);

    sandbox.restore();
});

test.serial('It translates problems to diagnostics', async (t) => {
    const sandbox = sinon.createSandbox();
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const problems: Partial<Problem>[] = [
        {
            hintId: 'test-id-1',
            location: {
                column: 5,
                line: 7
            },
            message: 'Test Message 1',
            severity: Severity.warning
        },
        {
            hintId: 'test-id-2',
            location: {
                column: -1,
                line: -1
            },
            message: 'Test Message 2',
            severity: Severity.error
        },
        {
            hintId: 'test-id-3',
            location: {
                column: -1,
                line: -1
            },
            message: 'Test Message 3',
            severity: Severity.off
        }
    ];

    sandbox.spy(mock.connection, 'sendDiagnostics');
    sandbox.stub(mock.document, 'getText').returns(testContent);
    sandbox.stub(mock.document, 'uri').get(() => {
        return testUri;
    });
    sandbox.spy(mock.engine, 'clear');
    sandbox.stub(mock.engine, 'executeOn').returns(problems);

    await mock.contentWatcher({ document: mock.document });

    t.true(t.context.engine.clear.calledOnce);
    t.true(t.context.connection.sendDiagnostics.calledOnce);

    t.is(t.context.connection.sendDiagnostics.args[0][0].uri, testUri);

    const diagnostics = t.context.connection.sendDiagnostics.args[0][0].diagnostics as Diagnostic[];

    t.is(diagnostics.length, 3);

    t.is(diagnostics[0].source, 'webhint');
    t.true(diagnostics[0].message.indexOf(problems[0].message) !== -1);
    t.true(diagnostics[0].message.indexOf(problems[0].hintId) !== -1);
    t.is(diagnostics[0].severity, DiagnosticSeverity.Warning);
    t.is(diagnostics[0].range.start.line, problems[0].location.line);
    t.is(diagnostics[0].range.start.character, problems[0].location.column);

    t.is(diagnostics[1].severity, DiagnosticSeverity.Error);
    t.is(diagnostics[1].range.start.line, 0);
    t.is(diagnostics[1].range.start.character, 0);

    t.is(diagnostics[2].severity, DiagnosticSeverity.Hint);

    sandbox.restore();
});
