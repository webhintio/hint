import * as Handlebars from 'handlebars';
import { fs } from '@hint/utils';
import { loadCreateHintPackage } from './utils';

const { readFileAsync } = fs;

const pkg = loadCreateHintPackage();

/**
 * Searches package version in `create-hint/package.json` for given `packageName` and uses that version or the `defaultVersion`.
 *
 * It is recommended to add package as `devDependencies` in `create-hint/package.json` whenever new `package` is added to `package.hbs` template.
 *
 * This is used when creating a new hint via the CLI to make sure the dependencies are up-to-date in the moment
 * of creation.
 */
Handlebars.registerHelper('dependencyVersion', (packageName, defaultVersion): string => {
    let version = pkg.dependencies[packageName] ||
        pkg.devDependencies[packageName] ||
        defaultVersion;

    // hint is a `peerDependency` and should target only major versions
    if (packageName === 'hint') {
        version = `${version.split('.').shift()}.0.0`;
    }

    return `"${packageName}": "${version}"`;
});

/**
 * Use `escapeSafeString` function instead of triple curly brace in the templates
 * to escape the backticks (`) in the user's input.
 * Example:
 * ```
 * description: `This is a \`important\` hint that has 'single' and "double" quotes.`
 * ```
 */
export const escapeSafeString = (str: string): hbs.SafeString => {
    const result = str.replace(/(`)/g, '\\$1');

    return new Handlebars.SafeString(result);
};

/** Reads a handlebars template from the file system and compiles it. */
export const compileTemplate = async (filePath: string, data: any): Promise<string> => {
    let templateContent;

    try {
        templateContent = await readFileAsync(filePath);
    } catch (err) {
        throw (err);
    }

    const template = Handlebars.compile(templateContent);

    return template(data);
};

export default Handlebars;
