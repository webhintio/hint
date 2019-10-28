const fs = require('fs');
const path = require('path');
const { startCase } = require('lodash');

/**
 * @typedef {{
 *     id: string;
 *     metadata: {
 *         description: string;
 *         help: string;
 *     },
 *     tags: string[]
 * }} RuleMeta
 */

/**
 * @param {string} str
 */
const capitalize = (str) => {
    if (str === 'aria') {
        return 'ARIA';
    }

    return startCase(str).replace(/\band\b/i, 'and');
};

/**
 * @param {string} category
 */
const categoryId = (category) => {
    return category.replace('cat.', '');
};

/**
 * @param {string} id
 */
const escapeKey = (id) => {
    return id.includes('-') ? `'${id}'` : id;
};

/**
 * @param {RuleMeta} rule
 */
const isRuleDisabled = (rule) => {
    return rule.tags.includes('experimental') || rule.tags.every((tag) => {
        return !tag.startsWith('wcag');
    });
};

/**
 * @param {RuleMeta} rule
 */
const isRuleEnabled = (rule) => {
    return !isRuleDisabled(rule);
};

/**
 * @param {string} packagePath
 */
const mkdir = (packagePath) => {
    const dirname = path.resolve(`${__dirname}/../../${packagePath}`);

    return new Promise((resolve, reject) => {
        fs.mkdir(dirname, (err) => {
            if (err && err.code !== 'EEXIST') {
                reject(err);

                return;
            }

            resolve();
        });
    });
};

/**
 * @param {string} packagePath
 */
const readFile = (packagePath) => {
    const filename = path.resolve(`${__dirname}/../../${packagePath}`);

    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(new Error(`Unable to read ${filename}: ${err}`));
            }

            resolve(data);
        });
    });
};

/**
 * @param {string} packagePath
 * @param {string} content
 */
const writeFile = (packagePath, content) => {
    const filename = path.resolve(`${__dirname}/../../${packagePath}`);

    return new Promise((resolve, reject) => {
        fs.writeFile(filename, content, (err) => {
            if (err) {
                reject(new Error(`Unable to write ${filename}: ${err}`));

                return;
            }

            console.log(`Created: ${filename}`);
            resolve();
        });
    });
};

/**
 * @param {string} category
 * @param {RuleMeta[]} rules
 */
const rulesIn = (category, rules) => {
    if (category === 'cat.other') {
        return rules.filter((rule) => {
            return rule.tags.every((tag) => {
                return !tag.startsWith('cat.');
            });
        });
    }

    return rules.filter((rule) => {
        return rule.tags.includes(category);
    });
};

module.exports = {
    capitalize,
    categoryId,
    escapeKey,
    isRuleDisabled,
    isRuleEnabled,
    mkdir,
    readFile,
    rulesIn,
    writeFile
};
