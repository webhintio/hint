const defaultConfig: import('hint').UserConfig = { extends: ['development'] };

export const getUserConfig = (hintModule: typeof import('hint'), directory: string) => {
    const userConfig = hintModule.getUserConfig(directory) || defaultConfig;

    // The vscode extension only works with the local connector.
    userConfig.connector = { name: 'local' };

    if (!userConfig.hints) {
        userConfig.hints = {};
    }

    /*
     * Ensure `http-compression` is disabled; there could be issues loading
     * `iltorb` if it was compiled for a different version of `node` and the
     * `local` connector doesn't support it anyway.
     */
    (userConfig.hints as import('hint').HintsConfigObject)['http-compression'] = 'off';

    // Remove formatters because the extension doesn't use them.
    userConfig.formatters = [];

    if (!userConfig.parsers) {
        userConfig.parsers = [];
    }

    // Ensure the HTML parser is loaded.
    if (userConfig.parsers.indexOf('html') === -1) {
        userConfig.parsers.push('html');
    }

    return userConfig;
};
