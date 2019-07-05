const { categoryId, readFile, writeFile } = require('./utils');

/**
 * Generate `index.json` for `@hint/configuration-accessibility`
 * to ensure all sub-hints of `hint-axe` are enabled.
 *
 * @param {string[]} categories
 */
const createConfig = async (categories) => {
    const filename = '../configuration-accessibility/index.json';
    const configPackage = JSON.parse(await readFile(filename));

    configPackage.hints = {};

    for (const category of categories) {
        const id = `axe/${categoryId(category)}`;

        configPackage.hints[id] = 'error';
    }

    const json = JSON.stringify(configPackage, null, 4);

    await writeFile(filename, `${json}\n`);
};

module.exports = { createConfig };
