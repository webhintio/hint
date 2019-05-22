/* eslint-disable sort-keys */
/**
 * Spec: https://github.com/webhintio/hint/issues/1643
 */
import * as Listr from 'listr';
import { Arguments } from 'yargs';

import { skipReasons, skipInstallation, skipIfAborted, skipIfError, skipIfForced, skipIfJustRelease } from './lib/skippers';
import { taskErrorWrapper } from './lib/utils';
import { updateChangelogs } from './tasks/update-changelogs';
import { updateThirdPartyResources } from './lib/update-3rd-party';
import { argv } from './lib/yargs-config';
import { getPackages } from './tasks/get-packages';
import { calculateChangedPackages } from './tasks/calculate-changed-packages';
import { calculateNewVersions } from './tasks/calculate-new-versions';
import { savePackageChanges } from './tasks/save-changes';
import { cleanUp } from './tasks/clean-up';
import { runTests } from './tasks/run-tests';
import { validateChanges } from './tasks/validate-changes';
import { validateEnvironment } from './tasks/validate-environment';
import { confirmRelease, release } from './tasks/release';
import { commitPackagesChanges } from './tasks/commit-packages-changes';
import { authenticateGitHub } from './tasks/authenticate-github';
import { cleanWorkspace } from './tasks/clean-workspace';
import { deauthenticateGitHub } from './tasks/deauthenticate-github';
import { pushChanges } from './tasks/push-changes';
import { installDependencies } from './tasks/install-dependencies';
import { Parameters } from './@types/custom';

const ignoredPackages = ['extension-vscode', 'extension-browser'];

/** The tasks to be executed in sequential order. */
const tasks = new Listr([
    {
        title: 'Validate and configure environment',
        task: taskErrorWrapper(validateEnvironment)
    },
    {
        title: 'Authenticate in GitHub',
        skip: skipReasons(skipIfError, skipIfJustRelease),
        task: taskErrorWrapper(authenticateGitHub)
    },
    {
        title: 'Get local packages',
        skip: skipReasons(skipIfError),
        task: taskErrorWrapper(getPackages(ignoredPackages))
    },
    {
        title: 'Run 3rd party update tasks',
        skip: skipReasons(skipIfError, skipIfJustRelease),
        task: updateThirdPartyResources
    },
    {
        title: 'Calculating changes',
        skip: skipReasons(skipIfError, skipIfJustRelease),
        task: taskErrorWrapper(calculateChangedPackages)
    },
    {
        title: 'Calculate new versions',
        skip: skipReasons(skipIfError, skipIfJustRelease),
        task: calculateNewVersions
    },
    {
        title: 'Update changelogs',
        skip: skipReasons(skipIfError, skipIfJustRelease),
        task: updateChangelogs()
    },
    {
        title: 'Save changes in disk',
        skip: skipReasons(skipIfError, skipIfAborted, skipIfJustRelease),
        task: taskErrorWrapper(savePackageChanges)
    },
    {
        title: 'Cleanup workspace',
        skip: skipReasons(skipIfError, skipIfAborted, skipInstallation),
        task: cleanWorkspace()
    },
    /**
     * Cross-deps should be updated by now and we need to make sure to commit
     * the latest `yarn.lock` that might remove bad ones. E.g.: if a package
     * was pointing to `hint: 4.5.0` instead of `5.0.0`, `node_modules` could
     * have that version downloaded instead of the right one.
     */
    {
        title: 'Install dependencies',
        skip: skipReasons(skipIfError, skipIfAborted, skipInstallation),
        task: taskErrorWrapper(installDependencies)
    },
    {
        title: 'Commit changes',
        skip: skipReasons(skipIfError, skipIfAborted, skipIfJustRelease),
        task: taskErrorWrapper(commitPackagesChanges)
    },
    {
        title: 'Validate changes',
        skip: skipReasons(skipIfError, skipIfForced, skipIfJustRelease),
        task: taskErrorWrapper(validateChanges)
    },
    {
        title: 'Build and test',
        skip: skipReasons(skipIfError, skipIfAborted, skipIfJustRelease),
        task: runTests()
    },
    {
        title: 'Confirm npm publishing',
        skip: skipReasons(skipIfError, skipIfAborted, skipIfForced),
        task: confirmRelease
    },
    {
        title: 'Publish on npm',
        skip: skipReasons(skipIfError, skipIfAborted),
        task: release()
    },
    {
        title: 'Publish changes in GitHub',
        skip: skipReasons(skipIfError, skipIfAborted, skipIfJustRelease),
        task: pushChanges
    },
    {
        title: 'Deauthenticate GitHub',
        skip: skipReasons(skipIfJustRelease),
        task: deauthenticateGitHub
    },
    {
        title: 'Clean up',
        task: cleanUp
    }
], { exitOnError: false });

/**
 * `yargs` exists directly when using --help but this will happen
 * after the UI has listed all the tasks so it's cleaner to do it
 * this way.
 */
if (!(argv as Arguments<Parameters>).help) {
    tasks.run()
        .catch((e) => {
            console.error('There was an error in the process. Check the logs for more information.');

            process.exitCode = 1;
        });
}
