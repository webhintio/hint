const fs = require('fs');
const globby = require('globby');
const path = require('path');
const pkg = require('../package.json');
const lodash = require('lodash');

const main = async () => {
    const paths = await globby('src/_locales/*/messages.json');
    const locales = paths.map((path) => {
        return path.split('/').slice(-2, -1);
    });

    const webhintModules = Object.keys(pkg.devDependencies).filter((name) => {
        return name === 'hint' || name.startsWith('@hint/');
    });

    // Generate merged `messages.json` for each locale.

    for (const locale of locales) {
        const messages = require(`../src/_locales/${locale}/messages.json`);
        const filename = path.resolve(`dist/bundle/_locales/${locale}/messages.json`);

        for (const module of webhintModules) {
            try {
                const moduleMessages = require(`${module}/src/_locales/${locale}/messages.json`);

                for (const [key, value] of Object.entries(moduleMessages)) {
                    const prefix = lodash.camelCase(module.replace('@hint/', ''));
                    messages[`${prefix}_${key}`] = value;
                }
            } catch (e) {
                console.log(`No '${locale}' strings found for ${module}.`);
            }
        }

        fs.writeFile(filename, JSON.stringify(messages, null, 4), (err) => {
            if (err) {
                throw err;
            } else {
                console.log(`Created: ${filename}`);
            }
        });
    }
};

main();
