import test from 'ava';
import * as sinon from 'sinon';
import { RemoteWindow } from 'vscode-languageserver';

import { promptRetry } from '../../src/utils/prompts';

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
