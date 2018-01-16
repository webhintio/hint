/*
 * This script updates Greenkeeper's commits so that they:
 *
 *   * Also update the `package-lock.json` file.
 *   * Follow the project's commit message conventions.
 */

const { exec, getLastCommitAuthorEmail, getLastCommitAuthorName, getLastCommitSubject } = require('../scripts/utils');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const generateNewCommitMessage = (originalCommitMessage) => {
    const regex = /.*update\s(.*)\sto version\s([\w.-]+)/gi;
    const result = regex.exec(originalCommitMessage);

    if (result) {
        return `Upgrade: \\\`${result[1]}\\\` to \\\`v${result[2]}\\\``;
    }

    return null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

    const GIT_COMMIT_SUBJECT = await getLastCommitSubject();
    const GIT_USER_NAME = await getLastCommitAuthorName();
    const NEW_COMMIT_MESSAGE = generateNewCommitMessage(GIT_COMMIT_SUBJECT);

    if (NEW_COMMIT_MESSAGE) {
        const GIT_GREENKEEPER_BRANCH = process.env.TRAVIS_BRANCH; // eslint-disable-line no-process-env
        const GIT_REPO_SLUG = process.env.TRAVIS_REPO_SLUG; // eslint-disable-line no-process-env
        const GIT_USER_EMAIL = await getLastCommitAuthorEmail();

        await exec(`Switch to the '${GIT_GREENKEEPER_BRANCH}' branch.`, `git checkout ${GIT_GREENKEEPER_BRANCH}`);
        await exec('Configure the Git user name and email.',
                   `git config --global user.name "${GIT_USER_NAME}" &&
                    git config --global user.email "${GIT_USER_EMAIL}"`);
        await exec(`Update 'package-lock.json'.`, 'npm install --package-lock-only');
        await exec('Commit changes.', `git add -A && git commit --amend --message="${NEW_COMMIT_MESSAGE}"`);
        await exec(`Push changes to the '${GIT_GREENKEEPER_BRANCH}' branch.`, `git push -f git@github.com:${GIT_REPO_SLUG}.git "${GIT_GREENKEEPER_BRANCH}"`);
    } else {
        console.log('\nCommit message was not changed.');
    }
};

main();
