import { URL } from 'url';

import * as mock from './fixtures/mocks';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { Problem, Severity, Target } from 'hint/dist/src/lib/types';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode-languageserver';

type ServerContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ServerContext>;

const mockContext = () => {
    const mocks = mock.mocks();

    proxyquire('../src/server', {
        './utils/analytics': mocks.analytics,
        '@hint/utils': mocks.hintUtils,
        child_process: mocks.child_process, // eslint-disable-line camelcase
        'vscode-languageserver': {
            createConnection: mocks.createConnection,
            Files: mocks.Files,
            ProposedFeatures: mocks.ProposedFeatures,
            TextDocuments: mocks.TextDocuments
        }
    });

    return {
        Analyzer: mocks.Analyzer,
        analyzer: mocks.analyzer,
        child_process: mocks.child_process, // eslint-disable-line camelcase
        connection: mocks.connection,
        contentWatcher: mocks.getContentWatcher(),
        document: mocks.document,
        documents: mocks.documents,
        Files: mocks.Files,
        fileWatcher: mocks.getFileWatcher(),
        hintUtils: mocks.hintUtils,
        initializer: mocks.getInitializer(),
        modules: mocks.modules
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
    const { connection, contentWatcher, document, analyzer, Files, initializer } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowWarningMessageStub = sandbox.stub(connection.window, 'showWarningMessage').returns({ title: 'Cancel' });
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    sandbox.stub(Files, 'resolveModule2').throws();

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowWarningMessageStub.calledOnce);
    t.false(analyzerAnalyzeStub.called);
});

test('It installs webhint if needed', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { child_process, connection, contentWatcher, document, analyzer, Files, initializer } = mockContext(); // eslint-disable-line camelcase

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowWarningMessageStub = sandbox.stub(connection.window, 'showWarningMessage').returns({ title: 'Add webhint' });

    sandbox.stub(Files, 'resolveModule2')
        .onFirstCall()
        .throws();

    const childProcessSpawnSpy = sandbox.spy(child_process, 'spawn');
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowWarningMessageStub.calledOnce);
    t.true(childProcessSpawnSpy.calledOnce);
    t.is(childProcessSpawnSpy.args[0][0], `npm${process.platform === 'win32' ? '.cmd' : ''}`);
    t.false(analyzerAnalyzeStub.called);
});

test('It installs webhint via yarn if `yarn.lock` is present', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { hintUtils, child_process, connection, contentWatcher, document, analyzer, Files, initializer } = mockContext(); // eslint-disable-line camelcase

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    sandbox.stub(hintUtils, 'hasYarnLock').resolves(true);
    const windowShowWarningMessageStub = sandbox.stub(connection.window, 'showWarningMessage').returns({ title: 'Add webhint' });

    sandbox.stub(Files, 'resolveModule2')
        .onFirstCall()
        .throws();

    const childProcessSpawnSpy = sandbox.spy(child_process, 'spawn');
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowWarningMessageStub.calledOnce);
    t.true(childProcessSpawnSpy.calledOnce);
    t.is(childProcessSpawnSpy.args[0][0], `yarn${process.platform === 'win32' ? '.cmd' : ''}`);
    t.false(analyzerAnalyzeStub.called);
});

test('It notifies if loading the configuration fails', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { connection, contentWatcher, document, analyzer, initializer, modules } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });

    const windowShowErrorMessageStub = sandbox.stub(connection.window, 'showErrorMessage').returns({ title: 'Ignore' });
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    sandbox.stub(modules.hint, 'createAnalyzer').throws();

    await initializer({ rootPath: '' });
    await contentWatcher({ document });

    t.true(windowShowErrorMessageStub.calledOnce);
    t.false(analyzerAnalyzeStub.called);
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
    const { contentWatcher, document, analyzer } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    await contentWatcher({ document });

    const target = analyzerAnalyzeStub.args[0][0] as Target;

    t.true(analyzerAnalyzeStub.calledOnce);
    t.is((target.url as URL).href, testUri);
    t.is(target.content, testContent);
});

test('It processes multiple files serially', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { connection, contentWatcher, document, analyzer } = mockContext();

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
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    const p1 = contentWatcher({ document });
    const p2 = contentWatcher({ document: document2 });

    sandbox.stub(connection, 'sendDiagnostics').value(() => {
        const target = analyzerAnalyzeStub.args[0][0] as Target;

        t.true(analyzerAnalyzeStub.calledOnce);
        t.is((target.url as URL).href, testUri);
        t.is(target.content, testContent);

        sandbox.stub(connection, 'sendDiagnostics').value(() => {
            const target = analyzerAnalyzeStub.args[1][0] as Target;

            t.is((target.url as URL).href, document2.uri);
            t.is(target.content, document2.getText());
        });
    });

    await Promise.all([p1, p2]);
});

test('It reloads and runs webhint on watched file changes', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const { document, documents, analyzer, fileWatcher } = mockContext();

    sandbox.stub(documents, 'all').returns([document]);
    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const analyzerAnalyzeStub = sandbox.stub(analyzer, 'analyze').resolves([]);

    await fileWatcher();

    const target = analyzerAnalyzeStub.args[0][0] as Target;

    t.true(analyzerAnalyzeStub.calledOnce);
    t.is((target.url as URL).href, testUri);
    t.is(target.content, testContent);
});

test('It translates problems to diagnostics', async (t) => {
    const sandbox = t.context.sandbox;
    const testContent = 'Test Content';
    const testUri = 'file:///test/uri';
    const problems: Problem[] = [
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
    ] as Problem[];
    const { connection, contentWatcher, document, analyzer } = mockContext();

    sandbox.stub(document, 'getText').returns(testContent);
    sandbox.stub(document, 'uri').get(() => {
        return testUri;
    });
    const connectionSendDiagnostics = sandbox.spy(connection, 'sendDiagnostics');

    sandbox.stub(analyzer, 'analyze').resolves([{ problems, url: testUri }]);

    await contentWatcher({ document });

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
