/*
 * This script automatically merges the Greenkeeper's commit.
 */

const {
    exec,
    getLastCommitAuthorEmail,
    getLastCommitAuthorName,
    getLastCommitSubject,
    getLastCommitsWithSameMessage
} = require('../scripts/utils');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// The format of the log should be `--oneline`
const getSHAs = (log) => {
    return log.trim()
        .split('\n')
        .map((line) => {
            return line.trim().split(' ')[0];
        });
};

const main = async () => {
    const GIT_COMMIT_SUBJECT = (await getLastCommitSubject()).replace(/`/g, '\\`');
    const COMMITS_TO_SQUASH = await getLastCommitsWithSameMessage();
    const GIT_GREENKEEPER_BRANCH = process.env.TRAVIS_BRANCH; // eslint-disable-line no-process-env
    const GIT_REPO_SLUG = process.env.TRAVIS_REPO_SLUG; // eslint-disable-line no-process-env
    const GIT_USER_EMAIL = await getLastCommitAuthorEmail();
    const GIT_USER_NAME = await getLastCommitAuthorName();

    await exec('Configure the Git user name.', `git config --global user.name "${GIT_USER_NAME}"`);
    await exec('Configure the Git user email.', `git config --global user.email "${GIT_USER_EMAIL}"`);

    await exec(`Set remote.`, `git remote set-branches origin master`);
    await exec('Fetch content from origin', 'git fetch origin --unshallow');

    /*
     * Greenkeeper updates each package in the monorepo with the same
     * dependency in different commits but the project style is only 1.
     *
     * Instead of rebase/squash, do a soft reset with the same commit
     * message.
     *
     * Also greenkeeper does not update yarn.lock in all scenarios (e.g:
     * in range updates), so we add the new generated file.
     */
    await exec(`Soft reset latest ${COMMITS_TO_SQUASH} commits.`, `git reset --soft HEAD~${COMMITS_TO_SQUASH}`);
    await exec(`Stage lock file`, `git add yarn.lock`);
    const files = await exec(`Files changed.`, `git status`);

    console.log(files);

    await exec(`Create new commit.`, `git commit --message="${GIT_COMMIT_SUBJECT}"`);

    /*
     * The changes are in dettached mode, and couldn't find a way to
     * rebase correctly in master. Store the SHA to cherry-pick later
     */
    const log = await exec(`Latest log entry.`, `git log --oneline -n 1`);
    const latestSha = getSHAs(log)[0];

    await exec(`Switch to the 'master' branch.`, 'git checkout master');
    await exec(`Cherry-pick '${latestSha}' into 'master'.`, `git cherry-pick ${latestSha}`);

    await exec(`Push changes to 'master'.`, `git push git@github.com:${GIT_REPO_SLUG}.git master`);
    await exec(`Delete '${GIT_GREENKEEPER_BRANCH}' branch.`, `git push git@github.com:${GIT_REPO_SLUG}.git :${GIT_GREENKEEPER_BRANCH}`);
};

main();
