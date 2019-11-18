import { hasFile, mkdir } from './fs';
import { createPackageJson, installPackages, loadPackage, InstallOptions } from './packages';

/** Timeout to start updating the shared webhint install. */
const updateWebhintTimeout = 120000;

/* istanbul ignore next */
const installWebhint = (options: InstallOptions) => {
    return installPackages(['hint@latest', 'typescript@latest'], options);
};

/**
 * Install or update a shared copy of webhint to the provided global storage
 * path reserved for the extension.
 */
/* istanbul ignore next */
export const updateSharedWebhint = async (globalStoragePath: string) => {
    try {
        /*
         * Per VS Code docs globalStoragePath may not exist but parent folder will.
         * https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalStoragePath
         */
        if (!await hasFile(globalStoragePath)) {
            await mkdir(globalStoragePath);
        }

        // A package.json must exist for `npm` to prune packages in the future.
        if (!await hasFile(`${globalStoragePath}/package.json`)) {
            await createPackageJson(globalStoragePath);
        }

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
        const hintPkg = await loadPackage('hint', { paths: [globalStoragePath] }) as typeof import('hint');

        /**
         * The shared package has been loaded successfully but it could be outdated.
         * The update process kicks off after a few seconds to allow everything to
         * get started first.
         */
        setTimeout(() => {
            console.log(`Updating shared version of "hint"`);

            updateSharedWebhint(globalStoragePath);
        }, updateWebhintTimeout);

        return hintPkg;
    } catch (e) {
        try {
            console.error(`Error loading shared "hint" package`);
            console.error(e);

            console.log(`Installing shared version of "hint"`);

            await updateSharedWebhint(globalStoragePath);

            return loadPackage('hint', { paths: [globalStoragePath] });
        } catch (err) {
            console.error('Unable to load shared webhint instance', err);

            return null;
        }
    }
};

/**
 * Tries to load webhint from the user workspace, then the shared copy
 * unless `directory` is an empty string. In that cases it loads the
 * shared global version directly.
 */
export const loadWebhint = (directory: string, globalStoragePath: string): Promise<typeof import('hint') | null> => {
    try {
        /* istanbul ignore else */
        if (directory) {
            return loadPackage('hint', { paths: [directory] });
        }

        /* istanbul ignore next */
        return loadSharedWebhint(globalStoragePath);
    } catch (e) /* istanbul ignore next */ {
        console.error(`Error loading "hint" package from "${directory}"`);

        /**
         * If `directory` exists, we tried to load the workspace version first and failed
         * so we try again with the shared one now.
         */
        if (directory) {
            console.error(`Trying to load shared version`);

            return loadSharedWebhint(globalStoragePath);
        }

        return Promise.resolve(null);
    }
};
