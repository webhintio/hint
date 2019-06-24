const path = require('path');

const cwd = process.cwd();

const packageJSON = require(path.join(cwd, 'package.json'));
const packageName = packageJSON.name;

const i18nFile = path.join(cwd, 'src', '_locales', 'en', 'messages.json');

const messages = require(i18nFile);

const keys = Object.keys(messages);

const invalidKeys = keys.reduce((invalid, key) => {
    if (!key.startsWith(packageName)) {
        invalid.push(key);
    }

    return invalid;
}, []);

if (invalidKeys.length > 0) {
    console.error('Invalid keys found:');

    invalidKeys.forEach((invalidKeys) => {
        console.error(`- ${invalidKeys}`);
    });

    console.error(`Localization keys in package ${packageName} should start it package name`);
    process.exitCode = 1;
}
