import test from 'ava';
import * as sinon from 'sinon';
import { RemoteWindow } from 'vscode-languageserver';

import { promptAddWebhint, promptRetry } from '../../src/utils/prompts';

test('It prompts the user to install webhint', async (t) => {
    const install = sinon.stub().resolves();
    const showInformationMessage = sinon
        .stub<Parameters<RemoteWindow['showInformationMessage']>>()
        .resolves();

    await promptAddWebhint(
        { showInformationMessage } as Partial<RemoteWindow> as RemoteWindow,
        install
    );

    t.is(install.callCount, 0);
    t.is(showInformationMessage.callCount, 1);
    t.is(showInformationMessage.firstCall.args.length, 3);
    t.is(showInformationMessage.firstCall.args[0], 'A local `.hintrc` was found. Add webhint to this project?');
    t.deepEqual(showInformationMessage.firstCall.args[1], { title: 'Add webhint'});
    t.deepEqual(showInformationMessage.firstCall.args[2], { title: 'Cancel'});
});

test('It does not install if the user selects "Cancel"', async (t) => {
    const install = sinon.stub().resolves();
    const showInformationMessage = sinon
        .stub<Parameters<RemoteWindow['showInformationMessage']>>()
        .resolves({ title: 'Cancel '});

    await promptAddWebhint(
        { showInformationMessage } as Partial<RemoteWindow> as RemoteWindow,
        install
    );

    t.is(install.callCount, 0);
});

test('It does install if the user selects "Add webhint"', async (t) => {
    const install = sinon.stub().resolves();
    const showInformationMessage = sinon
        .stub<Parameters<RemoteWindow['showInformationMessage']>>()
        .resolves({ title: 'Add webhint' });

    await promptAddWebhint(
        { showInformationMessage } as Partial<RemoteWindow> as RemoteWindow,
        install
    );

    t.is(install.callCount, 1);
    t.is(showInformationMessage.callCount, 2);
    t.is(showInformationMessage.secondCall.args.length, 1);
    t.is(showInformationMessage.secondCall.args[0], 'Finished installing webhint!');
});

test('It notifies the user if installation fails', async (t) => {
    const install = sinon.stub().throws();
    const showErrorMessage = sinon
        .stub<Parameters<RemoteWindow['showErrorMessage']>>()
        .resolves();
    const showInformationMessage = sinon
        .stub<Parameters<RemoteWindow['showInformationMessage']>>()
        .resolves({ title: 'Add webhint' });

    await promptAddWebhint(
        { showErrorMessage, showInformationMessage } as Partial<RemoteWindow> as RemoteWindow,
        install
    );

    t.is(install.callCount, 1);
    t.is(showErrorMessage.callCount, 1);
    t.is(showErrorMessage.firstCall.args.length, 1);
    t.regex(showErrorMessage.firstCall.args[0], /^Unable to install webhint/);
});

test('It prompts the user to retry if initializing webhint fails', async (t) => {
    const retry = sinon.stub().resolves(null);
    const showErrorMessage = sinon
        .stub<Parameters<RemoteWindow['showErrorMessage']>>()
        .resolves();

    const module: typeof import('hint') | null = await promptRetry(
        { showErrorMessage } as Partial<RemoteWindow> as RemoteWindow,
        retry
    );

    t.is(retry.callCount, 0);
    t.is(module, null);
});

test('It retries if the user selects "Retry"', async (t) => {
    const mockModule = {} as typeof import('hint');
    const retry = sinon.stub().resolves(mockModule);
    const showErrorMessage = sinon
        .stub<Parameters<RemoteWindow['showErrorMessage']>>()
        .resolves({ title: 'Retry' });

    const module: typeof import('hint') | null = await promptRetry(
        { showErrorMessage } as Partial<RemoteWindow> as RemoteWindow,
        retry
    );

    t.is(retry.callCount, 1);
    t.is(module, mockModule);
});
