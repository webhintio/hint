import { RemoteWindow } from 'vscode-languageserver';

export const promptRetry = async <T>(window: RemoteWindow, retry: () => Promise<T | null>): Promise<T | null> => {
    // Prompt the user to retry after checking their configuration.
    const retryTitle = 'Retry';
    const answer = await window.showErrorMessage(
        'Unable to start webhint. Ensure you are using the latest version of the `hint` package.',
        { title: retryTitle }
    );

    // Retry if asked.
    if (answer && answer.title === retryTitle) {
        return retry();
    }

    return null;
};
