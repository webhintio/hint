/*
 * This script automatically merges the Greenkeeper's commit.
 */

const { exec, getLastCommitAuthorEmail, getLastCommitAuthorName, getLastCommitSubject, getLastCommitsWithSameMessage } = require('../scripts/utils');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const generateNewCommitMessage = (originalCommitMessage) => {
    const regex = /.*update\s(.*)\sto version\s([\w.-]+)/gi;
    const result = regex.exec(originalCommitMessage);

    if (result) {
        return `Chore: \\\`${result[1]}\\\` to \\\`v${result[2]}\\\``;
    }

    return null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {
    const GIT_COMMIT_SUBJECT = await getLastCommitSubject();
    const COMMITS_TO_SQUASH = await getLastCommitsWithSameMessage();
    const NEW_COMMIT_MESSAGE = generateNewCommitMessage(GIT_COMMIT_SUBJECT);


    const GIT_GREENKEEPER_BRANCH = process.env.TRAVIS_BRANCH; // eslint-disable-line no-process-env
    const GIT_REPO_SLUG = process.env.TRAVIS_REPO_SLUG; // eslint-disable-line no-process-env
    const GIT_USER_EMAIL = await getLastCommitAuthorEmail();
    const GIT_USER_NAME = await getLastCommitAuthorName();

    /*
     * Ensure that things work as expected for shallow clones.
     * (This is usually the case with CIs such as Travis)
     */
    await exec('Set remote', `git remote set-branches origin ${GIT_GREENKEEPER_BRANCH}`);

    // Update local data.
    await exec('Fetch remote', `git fetch`)

    await exec('Configure the Git user name and email.',
                `git config --global user.name "${GIT_USER_NAME}"
                 git config --global user.email "${GIT_USER_EMAIL}"`);
    // `install` step in travis does a yarn. If versions are different, yarn.lock is different so discard changes.
    await exec('Discard yarn.lock', `git checkout yarn.lock`);

    // greenkeeper updates each package in the monorepo with the same dependency in different commits: squash and update message
    await exec('Commit changes and squash.', `git reset --soft HEAD~${COMMITS_TO_SQUASH} && git commit --message="${NEW_COMMIT_MESSAGE}"`);

    await exec(`Update 'origin' remote.`, `git remote remove origin && git remote add origin git@github.com:${GIT_REPO_SLUG}.git`);
    await exec('Fetch content from origin', 'git fetch origin');
    await exec(`Switch to the 'master' branch.`, 'git checkout master');

    const changes = await exec('List changed files', 'git status');
    console.log(changes);

    await exec(`Rebase '${GIT_GREENKEEPER_BRANCH}' branch into 'master'`, `git rebase ${GIT_GREENKEEPER_BRANCH}`);
    await exec(`Push changes to 'master'.`, `git push git@github.com:${GIT_REPO_SLUG}.git master`);
    await exec(`Delete '${GIT_GREENKEEPER_BRANCH}' branch.`, `git push git@github.com:${GIT_REPO_SLUG}.git :${GIT_GREENKEEPER_BRANCH}`);
};

main();
