/*
 * This script updates Greenkeeper's commits so that they:
 *
 *   * Also update the `package-lock.json` file.
 *   * Follow the project's commit message conventions.
 */

const exec = require('./utils').exec;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Only do the following if within a pull request.

if (process.env.TRAVIS_PULL_REQUEST !== 'false') { // eslint-disable-line no-process-env
    process.exit(0); // eslint-disable-line no-process-exit
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const getLastCommitInfo = async (message, format) => {
    // See: https://git-scm.com/docs/pretty-formats#_pretty_formats.
    return await exec(message, `git show --no-patch --format=%${format} -1`);
};

const getLastCommitAuthorEmail = async () => {
    return await getLastCommitInfo('Get author email for the last commit.', 'ae');
};

const getLastCommitAuthorName = async () => {
    return await getLastCommitInfo('Get author name for the last commit.', 'an');
};

const getLastCommitSubject = async () => {
    return await getLastCommitInfo('Get subject for the last commit.', 's');
};

const generateNewCommitMessage = (originalCommitMessage) => {
    const regex = /.*update\s(.*)\sto version\s([\w.-]+)/gi;
    const result = regex.exec(originalCommitMessage);

    if (result) {
        return `Upgrade: \\\`${result[1]}\\\` to \\\`v${result[2]}\\\``;
    }

    return null;
};

const main = async () => {

    const GIT_USER_NAME = await getLastCommitAuthorName();

    if (GIT_USER_NAME !== 'greenkeeper[bot]') {
        return;
    }

    await exec(`Update 'package-lock.json'.`, 'npm install --package-lock-only');

    const GIT_BRANCH = process.env.TRAVIS_BRANCH; // eslint-disable-line no-process-env
    const GIT_COMMIT_SUBJECT = await getLastCommitSubject();
    const GIT_USER_EMAIL = await getLastCommitAuthorEmail();
    const NEW_COMMIT_MESSAGE = generateNewCommitMessage(GIT_COMMIT_SUBJECT);

    if (NEW_COMMIT_MESSAGE && GIT_BRANCH) {
        await exec(`Switch to the '${GIT_BRANCH}' branch.`, `git checkout ${GIT_BRANCH}`);
        await exec('Configure the Git user name and email.', `git config --global user.name "${GIT_USER_NAME}" && git config --global user.email "${GIT_USER_EMAIL}"`);
        await exec('Commit changes.', `git add -A && git commit --amend --message="${NEW_COMMIT_MESSAGE}"`);
        await exec('Push changes upstream.', `git push -f git@github.com:alrra/sonar.git "${GIT_BRANCH}"`);
    }
};

main();
