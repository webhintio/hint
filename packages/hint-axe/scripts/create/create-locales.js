const { camelCase, lowerCase, upperFirst } = require('lodash');
const { categoryId, readFile, writeFile } = require('./utils');

/**
 * @param {string} str
 */
const nameCase = (str) => {
    if (str === 'aria') {
        return 'ARIA';
    }

    return upperFirst(lowerCase(str));
};

/**
 * @param {string[]} categories
 */
const createLocales = async (categories) => {
    const filename = 'src/_locales/en/messages.json';
    const messages = JSON.parse(await readFile(filename));

    for (const category of categories) {
        const id = categoryId(category);
        const camelCaseId = camelCase(id);

        messages[`${camelCaseId}_description`] = {
            description: 'Metadata description',
            message: `Rules from axe category '${id}'`
        };

        messages[`${camelCaseId}_name`] = {
            description: 'Metadata name',
            message: nameCase(id)
        };
    }

    const newMessages = /** @type {any} */ ({});

    for (const key of Object.keys(messages).sort()) {
        newMessages[key] = messages[key];
    }

    const json = JSON.stringify(newMessages, null, 4);

    await writeFile(filename, `${json}\n`);
};

module.exports = { createLocales };
