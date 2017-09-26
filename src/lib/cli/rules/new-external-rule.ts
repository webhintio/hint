import * as path from 'path';

import * as fs from 'fs-extra';
import * as globby from 'globby';
import * as inquirer from 'inquirer';

import { CLIOptions } from '../../types';
import { debug as d } from '../../utils/debug';
import * as logger from '../../utils/logging';
import { readFileAsync, writeFileAsync } from '../../utils/misc';
import { processDir, packageDir } from './common';

const debug = d(__filename);
/** Name of the package to use as a template. */
const TEMPLATE_PACKAGE = '@sonarwhal/rule-template';
/** List of questions to ask the user. */
const questions = [
    {
        message: `What's the name of this rule?`,
        name: 'rule-name',
        type: 'input'
    },
    {
        message: `What's the description of this rule?`,
        name: 'rule-description',
        type: 'input'
    }
];

/** Copies the content of the rule template to `destination`. */
const copyTemplate = async (destination: string) => {
    const resolved: string = require.resolve(TEMPLATE_PACKAGE);
    const templatePath: string = resolved.substr(0, resolved.indexOf(path.normalize(TEMPLATE_PACKAGE))) + path.sep + TEMPLATE_PACKAGE;

    logger.log(`Creating new rule in ${destination}`);
    await fs.copy(templatePath, destination);
    logger.log('Template files copied');
};

/** Updates the content of a file in the template with the responses of the user. */
const updateContent = (original: string, entries: string[][]): string => {
    let content = original;

    entries.forEach(([entry, value]) => {
        content = content.replace(new RegExp(entry, 'gi'), value.trim());
    });

    return content;
};

/** Updates the content of a given file with the responses of the user. */
const updateFile = async (file: string, data: string[][]) => {
    const content = await readFileAsync(file);
    const transformed = updateContent(content, data);

    if (content !== transformed) {
        debug(`Updating the content of ${file}`);
        await writeFileAsync(file, transformed);
    }
};

/** Renames a given file if needed. */
const renameFile = async (file: string, data: string[][]) => {
    // this `path.join` is done to have the right sep based on the current platform
    const newFile = path.join(updateContent(file, data), '');

    if (newFile !== file) {
        debug(`Renaming ${file} to ${newFile}`);
        await fs.move(file, newFile);
    }
};

/** Updates all the occurrences of `sonarwhal-rule-name` and `sonarwhal-rule-description` to the
 *  user specified ones. */
const updateFiles = async (source: string, data) => {
    logger.log('Updating template content');
    const replacements: string[][] = Object.entries(data);
    const files = await globby([`${source}/**/*`, `!${source}/node_modules/**/*`, `!${source}/dist/**/*`], { nodir: true });

    for (const file of files) {
        await updateFile(file, replacements);
        await renameFile(file, replacements);
    }
};

/** Deletes any folder that is no longer needed. */
const deleteRemainingFolders = async (source: string) => {
    const dirs = await globby([`${source}/**/rule-template/**/`]);

    for (const dir of dirs) {
        debug(`Deleting ${dir}`);
        await fs.remove(dir);
    }
};

const normalizeData = (results: inquirer.Answers) => {
    const name = (results['rule-name'] as string)
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-');

    const newData = Object.assign({}, results, {
        '"main": "src/rule-template.ts",': `dist/src/${name}.js`, // package.json#main
        '"repository": "sonarwhal/rule-template",': '"repository": "",', // package.json#repository
        '@sonarwhal/rule-template': `sonarwhal-${name}`, // package.json#name
        'rule-name': name, // occurences of the name in md and ts files
        'rule-template': name // folder names
    });

    return newData;
};

/** Removes an existing rule files and any references in the documentation. */
export const newExternalRule = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.newRule || packageDir === processDir) {
        return false;
    }

    try {
        const results = await inquirer.prompt(questions);
        const data = normalizeData(results);
        const destination: string = path.join(processDir, `sonarwhal-${data['rule-name']}`);

        await copyTemplate(destination);
        await updateFiles(destination, data);
        await deleteRemainingFolders(destination);

        logger.log(`New rule ${data['rule-name']} created in ${destination}`);
        logger.log(`Please run 'npm install'`);

        return true;
    } catch (e) {
        logger.error('Error trying to create new rule');
        logger.error(e);

        return false;
    }


};
