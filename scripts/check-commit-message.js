const chalk = require('chalk');
const shell = require('shelljs');
const { ucs2 } = require('punycode');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

shell.config.silent = true;
shell.config.fatal = true;

const issues = [];

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const checkWording = (line, lineNumber) => {

    // This checks for cases such as:
    //
    // Fixed #number
    // Fixes owner/repo#number
    // Fixes https://example.com/...
    // Closed #number
    // Closes owner/dssad#121

    const regex = /((Fixe|Close)(d|s))\s+([^#\s]*#[0-9]*|https?:\/\/[^\s]+)/i;
    const match = line.match(regex);

    if (match) {
        issues.push(`[Line ${lineNumber}] Contains '${match[1]}' instead of '${match[1].toLowerCase().startsWith('fix') ? 'Fix' : 'Close'}'.`);
    }

};

const checkFirstLine = (line) => {
    const ALLOWED_TAGS = [
        'Fix',
        'Breaking',
        'Build',
        'Chore',
        'Docs',
        'New',
        'Update',
        'Upgrade'
    ];

    if (ucs2.decode(line).length > 50) {
        issues.push('[Line 1] Has over 50 characters.');
    }

    const tag = line.split(':')[0];

    if (!ALLOWED_TAGS.includes(tag)) {
        issues.push(`[Line 1] Does not start with one of the following tags: \n\n     ${ALLOWED_TAGS.join(':\n     ')}:\n`);
    }

    const afterTag = line.split(':')[1];

    if (!afterTag) {
        issues.push(`[Line 1] No summary.`);

    } else {
        const firstChar = afterTag.charAt(0);
        const secondChar = afterTag.charAt(1);

        if (firstChar !== ' ') {
            issues.push(`[Line 1] Does not have a space between tag and summary.`);
        }

        if (secondChar !== secondChar.toUpperCase()) {
            issues.push(`[Line 1] Summary does not start with uppercase letter.`);
        }
    }

    checkWording(line, 1);
};

const checkSecoundLine = (line) => {
    if ((typeof line !== 'undefined') &&
        (line !== '')) {
        issues.push('[Line 2] Should be blank.');
    }
};

const checkLine = (line, lineNumber) => {
    const chars = ucs2.decode(line);

    // If the line has more then 72 characters, and the part just before
    // and after the 72 limit contains spaces (i.e. it's not something
    // like a long URL), suggest splitting the line into multiple lines.

    if ((chars.length > 72) &&
        (chars.slice(60, chars.length).includes(32))) {
        issues.push(`[Line ${lineNumber}] Has over 72 characters, and should be split into multiple lines.`);
    }

    checkWording(line, lineNumber);
};

const getUncommentedLines = (lines) => {
    return lines.filter((line) => {
        return !line.startsWith('#');
    });
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = () => {

    const commitMsgLines = getUncommentedLines(shell.cat('.git/COMMIT_EDITMSG').split('\n'));

    // Releases are special cases, so they don't need to be checked.
    if (/^v\d+\.\d+\.\d+/i.test(commitMsgLines[0])) {
        return;
    }

    checkFirstLine(commitMsgLines[0]);
    checkSecoundLine(commitMsgLines[1]);

    for (let i = 2; i < commitMsgLines.length; i++) {
        checkLine(commitMsgLines[i], i + 1);
    }

    if (issues.length !== 0) {
        console.error(`The commit message:

---
${commitMsgLines.join('\n')}
---

does not respect the conventions, namely:
`);

        issues.forEach((issue) => {
            console.error(chalk.red(`* ${issue}`));
        });

        process.exit(1); // eslint-disable-line no-process-exit
    }
};

main();
