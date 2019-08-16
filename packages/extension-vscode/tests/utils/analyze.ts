import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { Connection, TextDocument, RemoteWindow } from 'vscode-languageserver';

import * as _analyze from '../../src/utils/analyze';
import * as _packages from '../../src/utils/webhint-packages';

const stubConnection = () => {
    return {
        sendDiagnostics() {},
        sendNotification() {},
        window: {
            showErrorMessage() {
                return Promise.resolve();
            },
            showInformationMessage() {
                return Promise.resolve();
            }
        } as Partial<RemoteWindow> as RemoteWindow
    } as Partial<Connection> as Connection;
};

const stubContext = () => {
    const hint = {
        createAnalyzer() {
            return {
                analyze() {
                    return Promise.resolve([]);
                },
                resources: { hints: [] } as any
            } as Partial<import('hint').Analyzer> as import('hint').Analyzer;
        },
        getUserConfig() {
            return {};
        }
    } as Partial<typeof import('hint')>;

    const stubs = {
        './webhint-packages': {
            '@noCallThru': true,
            loadWebhint() {
                return Promise.resolve(hint);
            },
            updateSharedWebhint() {
                return Promise.resolve();
            }
        } as Partial<typeof _packages> as typeof _packages,
        hint
    };

    const module = proxyquire('../../src/utils/analyze', stubs) as typeof _analyze;

    return { module, stubs };
};

const stubTextDocument = (uri = 'file:///test/uri.html', content = 'Test content') => {
    return {
        getText() {
            return content;
        },
        uri
    } as TextDocument;
};

test('It notifies if loading the configuration fails', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const createAnalyzerStub = sandbox.stub(stubs.hint, 'createAnalyzer').throws('Test error');
    const connection = stubConnection();
    const showErrorMessageStub = sandbox.stub(connection.window, 'showErrorMessage').resolves();
    const analyzer = new module.Analyzer('', connection);

    await analyzer.validateTextDocument(stubTextDocument(), '');

    t.true(createAnalyzerStub.calledOnce);
    t.true(showErrorMessageStub.calledOnce);
    t.true(showErrorMessageStub.firstCall.args[0].startsWith('Unable to start webhint.'));

    sandbox.restore();
});

test('It processes multiple files serially', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module } = stubContext();
    const connection = stubConnection();
    const sendDiagnosticsSpy = sandbox.spy(connection, 'sendDiagnostics');
    const analyzer = new module.Analyzer('', connection);

    const uri1 = 'file:///test/uri/1';
    const uri2 = 'file:///test/uri/2';

    await Promise.all([
        analyzer.validateTextDocument(stubTextDocument(uri1), ''),
        analyzer.validateTextDocument(stubTextDocument(uri2), '')
    ]);

    t.is(sendDiagnosticsSpy.callCount, 2);
    t.is(sendDiagnosticsSpy.firstCall.args[0].uri, uri1);
    t.is(sendDiagnosticsSpy.secondCall.args[0].uri, uri2);

    sandbox.restore();
});

test('It reloads webhint after configuration changes', async (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const connection = stubConnection();
    const loadWebhintSpy = sandbox.spy(stubs['./webhint-packages'], 'loadWebhint');
    const analyzer = new module.Analyzer('', connection);

    await analyzer.validateTextDocument(stubTextDocument(), '');

    t.is(loadWebhintSpy.callCount, 1);

    await analyzer.validateTextDocument(stubTextDocument(), '');

    t.is(loadWebhintSpy.callCount, 1);

    analyzer.onConfigurationChanged();

    await analyzer.validateTextDocument(stubTextDocument(), '');

    t.is(loadWebhintSpy.callCount, 2);

    sandbox.restore();
});
