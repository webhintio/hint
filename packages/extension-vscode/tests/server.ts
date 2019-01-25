import * as mock from './fixtures/mocks';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { Problem, Severity } from 'hint/dist/src/lib/types';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';

type ServerContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ServerContext>;

const mockContext = () => {
    const mocks = mock.mocks();

    proxyquire('../src/server', {
        fs: mocks.fs,
        child_process: mocks.child_process, // eslint-disable-line
        'vscode-languageserver': {
            createConnection: mocks.createConnection,
            Files: mocks.Files,
            ProposedFeatures: mocks.ProposedFeatures,
            TextDocuments: mocks.TextDocuments
        }
    });

    return {
        access: mocks.access,
        child_process: mocks.child_process, // eslint-disable-line camelcase
        Configuration: mocks.Configuration,
        connection: mocks.connection,
        contentWatcher: mocks.getContentWatcher(),
        document: mocks.document,
        documents: mocks.documents,
        engine: mocks.engine,
        Files: mocks.Files,
        fileWatcher: mocks.getFileWatcher(),
        initializer: mocks.getInitializer()
    };
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('It notifies if loading webhint fails', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { connection, contentWatcher, document, engine, Files, initializer } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowWarningMessageStub = sandbox.stub(connection.window, 'showWarningMessage').returns({ title: 'Cancel' });
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    sandbox.stub(Files, 'resolveModule2').throws();

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowWarningMessageStub.calledOnce);
    t.false(engineExecuteOnSpy.called);
});

test('It installs webhint if needed', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { child_process, connection, contentWatcher, document, engine, Files, initializer } = mockContext(); // eslint-disable-line camelcase

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowWarningMessageStub = sandbox.stub(connection.window, 'showWarningMessage').returns({ title: 'Add webhint' });

    sandbox.stub(Files, 'resolveModule2')
        .onFirstCall()
        .throws();

    const childProcessSpawnSpy = sandbox.spy(child_process, 'spawn');
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowWarningMessageStub.calledOnce);
    t.true(childProcessSpawnSpy.calledOnce);
    t.is(childProcessSpawnSpy.args[0][0], `npm${process.platform === 'win32' ? '.cmd' : ''}`);
    t.false(engineExecuteOnSpy.called);
});

test('It installs webhint via yarn if `yarn.lock` is present', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { access, child_process, connection, contentWatcher, document, engine, Files, initializer } = mockContext(); // eslint-disable-line camelcase

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    sandbox.stub(access, 'error').returns(null);
    const windowShowWarningMessageStub = sandbox.stub(connection.window, 'showWarningMessage').returns({ title: 'Add webhint' });

    sandbox.stub(Files, 'resolveModule2')
        .onFirstCall()
        .throws();

    const childProcessSpawnSpy = sandbox.spy(child_process, 'spawn');
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowWarningMessageStub.calledOnce);
    t.true(childProcessSpawnSpy.calledOnce);
    t.is(childProcessSpawnSpy.args[0][0], `yarn${process.platform === 'win32' ? '.cmd' : ''}`);
    t.false(engineExecuteOnSpy.called);
});

test('It notifies if loading the configuration fails', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { Configuration, connection, contentWatcher, document, engine, initializer } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowErrorMessageStub = sandbox.stub(connection.window, 'showErrorMessage').returns({ title: 'Ignore' });
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    sandbox.stub(Configuration, 'fromConfig').throws();

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowErrorMessageStub.calledOnce);
    t.false(engineExecuteOnSpy.called);
});

test('It loads a local copy of webhint', async (t) => {
    const sandbox = t.context.sandbox;
    const testPath = '/test/path';
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { connection, contentWatcher, document, Files, initializer } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowWarningMessageStub = sandbox.spy(connection.window, 'showWarningMessage');
    const filesResolveModule2Spy = sandbox.spy(Files, 'resolveModule2');

    await initializer({ rootPath: testPath });
    await contentWatcher({ document });

    t.is(filesResolveModule2Spy.args[0][0], testPath);
    t.false(windowShowWarningMessageStub.called);
});

test('It runs webhint on content changes', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { contentWatcher, document, engine } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    await contentWatcher({ document });

    t.true(engineExecuteOnSpy.calledOnce);
    t.is(engineExecuteOnSpy.args[0][0].href, testUri);
    t.is(engineExecuteOnSpy.args[0][1]!.content, testContent);
});

test('It processes multiple files serially', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { connection, contentWatcher, document, engine } = mockContext();

    const document2 = {
        getText() {
            return 'Test Content 2';
        },
        get uri() {
            return 'file:///test/uri2';
        }
    } as TextDocument;

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    const p1 = contentWatcher({ document });
    const p2 = contentWatcher({ document: document2 });

    sandbox.stub(connection, 'sendDiagnostics').value(() => {
        t.true(engineExecuteOnSpy.calledOnce);
        t.is(engineExecuteOnSpy.args[0][0].href, testUri);
        t.is(engineExecuteOnSpy.args[0][1]!.content, testContent);

        sandbox.stub(connection, 'sendDiagnostics').value(() => {
            t.is(engineExecuteOnSpy.args[1][0].href, document2.uri);
            t.is(engineExecuteOnSpy.args[1][1]!.content, document2.getText());
        });
    });

    await Promise.all([p1, p2]);
});

test('It reloads and runs webhint on watched file changes', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { document, documents, engine, fileWatcher } = mockContext();

    sandbox.stub(documents, 'all').returns([document]);
    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');

    await fileWatcher();

    t.true(engineExecuteOnSpy.calledOnce);
    t.is(engineExecuteOnSpy.args[0][0].href, testUri);
    t.is(engineExecuteOnSpy.args[0][1]!.content, testContent);
});

test('It translates problems to diagnostics', async (t) => {
    const sandbox = t.context.sandbox;
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
    const { connection, contentWatcher, document, engine } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const connectionSendDiagnostics = sandbox.spy(connection, 'sendDiagnostics');
    const engineClearSpy = sandbox.spy(engine, 'clear');

    sandbox.stub(engine, 'executeOn').returns(problems);

    await contentWatcher({ document });

    t.true(engineClearSpy.calledOnce);
    t.true(connectionSendDiagnostics.calledOnce);

    t.is(connectionSendDiagnostics.args[0][0].uri, testUri);

    const diagnostics = connectionSendDiagnostics.args[0][0].diagnostics as Diagnostic[];

    t.is(diagnostics.length, 3);

    t.is(diagnostics[0].source, 'webhint');
    t.true(diagnostics[0].message.indexOf(problems[0].message || '') !== -1);
    t.true(diagnostics[0].message.indexOf(problems[0].hintId || '') !== -1);
    t.is(diagnostics[0].severity, DiagnosticSeverity.Warning);

    const location = problems[0].location;

    t.is(diagnostics[0].range.start.line, location && location.line);
    t.is(diagnostics[0].range.start.character, location && location.column);

    t.is(diagnostics[1].severity, DiagnosticSeverity.Error);
    t.is(diagnostics[1].range.start.line, 0);
    t.is(diagnostics[1].range.start.character, 0);

    t.is(diagnostics[2].severity, DiagnosticSeverity.Hint);
});
