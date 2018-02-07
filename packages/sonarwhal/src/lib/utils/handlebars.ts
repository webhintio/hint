import * as path from 'path';

import * as Handlebars from 'handlebars';

import { debug as d } from './debug';
import { readFileAsync } from './misc';
import { findPackageRoot, readFile } from './misc';

const debug = d(__filename);

export const sonarwhalPackage = JSON.parse(readFile(path.join(findPackageRoot(), 'package.json')));

Handlebars.registerHelper('dependencyVersion', (packageName, defaultVersion): string => {
    return sonarwhalPackage.dependencies[packageName] || sonarwhalPackage.devDependencies[packageName] || defaultVersion;
});

/**
 * Use `escapeSafeString` function instead of triple curly brace in the templates
 * to escape the backticks (`) in the user's input.
 * Example:
 * ```
 * description: `This is a \`important\` rule that has 'single' and "double" quotes.`
 * ```
 */
export const escapeSafeString = (str: string): hbs.SafeString => {
    const result = str.replace(/(`)/g, '\\$1');

    return new Handlebars.SafeString(result);
};

export const compileTemplate = async (filePath: string, data): Promise<string> => {
    let templateContent;

    try {
        templateContent = await readFileAsync(filePath);
    } catch (err) {
        debug(`Error reading file: ${filePath}`);
        throw (err);
    }

    const template = Handlebars.compile(templateContent);

    return template(data);
};
