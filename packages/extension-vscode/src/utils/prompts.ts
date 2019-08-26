import { RemoteWindow } from 'vscode-languageserver';

export const promptAddWebhint = async (window: RemoteWindow, install: () => Promise<void>) => {
    const addWebhint = 'Add webhint';
    const cancel = 'Cancel';
    const answer = await window.showInformationMessage(
        'A local `.hintrc` was found. Add webhint to this project?',
        { title: addWebhint },
        { title: cancel }
    );

    if (answer && answer.title === addWebhint) {
        try {
            await install();
            window.showInformationMessage('Finished installing webhint!');
        } catch (err) {
            window.showErrorMessage(`Unable to install webhint:\n${err}`);
        }
    }
};

export const promptRetry = async <T>(window: RemoteWindow, retry: () => Promise<T | null>): Promise<T | null> => {
    // Prompt the user to retry after checking their configuration.
    const retryTitle = 'Retry';
    const answer = await window.showErrorMessage(
        'Unable to start webhint. Ensure you are using the latest version of the `hint` and `@hint/configuration-development` packages.',
        { title: retryTitle }
    );

    // Retry if asked.
    if (answer && answer.title === retryTitle) {
        return retry();
    }

    return null;
};
