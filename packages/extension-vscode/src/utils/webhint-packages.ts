import { hasFile, mkdir } from './fs';
import { installPackages, loadPackage, InstallOptions } from './packages';

/* istanbul ignore next */
const installWebhint = (options: InstallOptions) => {
    return installPackages(['hint'], options);
};

/**
 * Install or update a shared copy of webhint to the provided global storage
 * path reserved for the extension.
 */
/* istanbul ignore next */
export const updateSharedWebhint = async (globalStoragePath: string) => {
    /*
     * Per VS Code docs globalStoragePath may not exist but parent folder will.
     * https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalStoragePath
     */
    if (!await hasFile(globalStoragePath)) {
        await mkdir(globalStoragePath);
        await updateSharedWebhint(globalStoragePath);
    }

    try {
        await installWebhint({ cwd: globalStoragePath });
    } catch (err) {
        console.warn('Unable to install shared webhint instance', err);
    }
};

/**
 * Load a shared copy of webhint from the provided global storage path
 * reserved for the extension. Installs a shared copy if none exists.
 */
/* istanbul ignore next */
const loadSharedWebhint = async (globalStoragePath: string): Promise<typeof import('hint') | null> => {
    try {
        return loadPackage('hint', { paths: [globalStoragePath] });
    } catch (err) {
        await updateSharedWebhint(globalStoragePath);
        console.error('Unable to load shared webhint instance', err);

        return null;
    }
};

/**
 * Load webhint, installing it if needed.
 * Will prompt to install a local copy if `.hintrc` is present.
 */
export const loadWebhint = async (directory: string, globalStoragePath: string, promptToInstall: (install: () => Promise<void>) => Promise<void>): Promise<typeof import('hint') | null> => {
    try {
        return loadPackage('hint', { paths: [directory] });
    } catch (e) {
        if (promptToInstall && await hasFile('.hintrc', directory)) {
            /**
             * Prompt to install, but don't wait in case the user ignores.
             * Load the shared copy for now until the install is done.
             * Caller is expected to reload once install is complete.
             */
            promptToInstall(async () => {
                await installWebhint({ cwd: directory });
            });
        }

        return loadSharedWebhint(globalStoragePath);
    }
};
