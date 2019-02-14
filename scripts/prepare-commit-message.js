const shell = require('shelljs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

shell.config.silent = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const GIT_COMMIT_MESSAGE_FILE = '.git/COMMIT_EDITMSG';

const NEW_GIT_COMMIT_MESSAGE = ` 
### Please follow commit style. Before committing see:
### https://webhint.io/docs/contributor-guide/getting-started/pull-requests/#commit-messages
###
# <Tag>: Capitalized, summary (50 chars recommended)
#
# If necessary, more detailed explanatory text and/or what this commit
# fixes, wrapped to about 72 characters or so. The commit message should
# be in the imperative: "Fix bug" and not "Fixed bug" or "Fixes bug."
# 
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 
# Fix #<issue>
#`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

try {

    const DEFAULT_GIT_COMMIT_MESSAGE = shell.cat(GIT_COMMIT_MESSAGE_FILE);

    /*
     * Only add the additional information to the commit message
     * if it's a new commit (there isn't yet a commit message),
     * so it's not a case such as an amend.
     */

    if ((/^\s+# Please enter the commit message for your changes.*/gi).test(DEFAULT_GIT_COMMIT_MESSAGE)) {
        shell.ShellString(`${NEW_GIT_COMMIT_MESSAGE} ${DEFAULT_GIT_COMMIT_MESSAGE}`).to(GIT_COMMIT_MESSAGE_FILE); // eslint-disable-line new-cap
    }

} catch (e) {
    /*
     * If something fails, ignore it, users will get
     * the default commit message, not a big deal.
     */
}
