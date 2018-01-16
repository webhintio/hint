/*
 * This script automatically merges the Greenkeeper's commit.
 */

const { exec, getLastCommitAuthorEmail, getLastCommitAuthorName } = require('../scripts/utils');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {
    const GIT_GREENKEEPER_BRANCH = process.env.TRAVIS_BRANCH; // eslint-disable-line no-process-env
    const GIT_REPO_SLUG = process.env.TRAVIS_REPO_SLUG; // eslint-disable-line no-process-env
    const GIT_USER_EMAIL = await getLastCommitAuthorEmail();
    const GIT_USER_NAME = await getLastCommitAuthorName();

    await exec(`Update 'origin' remote.`, `git remote remove origin && git remote add origin git@github.com:${GIT_REPO_SLUG}.git`);
    await exec('Fetch content from origin', 'git fetch origin');
    await exec(`Switch to the 'master' branch.`, 'git checkout master');
    await exec('Configure the Git user name and email.',
                `git config --global user.name "${GIT_USER_NAME}"
                 git config --global user.email "${GIT_USER_EMAIL}"`);
    await exec(`Merge '${GIT_GREENKEEPER_BRANCH}' branch into 'master'`, `git merge ${GIT_GREENKEEPER_BRANCH}`);
    await exec(`Push changes to 'master'.`, `git push git@github.com:${GIT_REPO_SLUG}.git master`);
    await exec(`Delete '${GIT_GREENKEEPER_BRANCH}' branch.`, `git push git@github.com:${GIT_REPO_SLUG}.git :${GIT_GREENKEEPER_BRANCH}`);
}

main();
