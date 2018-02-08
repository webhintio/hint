import * as path from 'path';
import { promisify } from 'util';

import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as mkdirp from 'mkdirp';

import { CLIOptions } from '../../types';
import * as logger from '../../utils/logging';
import { writeFileAsync } from '../../utils/misc';
import {
    processDir, packageDir, questions, normalize,
    QuestionsType, NewRule
} from './common';
import { escapeSafeString, compileTemplate, sonarwhalPackage } from '../../utils/handlebars';

const mkdirpAsync = promisify(mkdirp);
/** Name of the package to use as a template. */
const TEMPLATE_PATH = './templates/external-rule';
const TEMPLATE_COMMON_PATH = './templates/common';

/** Copies the common files of the rule to `destination`. */
const copyCommonFiles = async (destination: string) => {
    const commonFilesPath: string = path.join(__dirname, '..', 'external-files');

    logger.log(`Creating new rule in ${destination}`);
    await fs.copy(commonFilesPath, destination);
    logger.log('Common files copied');
};

const generateRuleFiles = async (destination: string, data) => {
    const commonFiles = [
    {
        destination: path.join(destination, 'README.md'),
        path: path.join(__dirname, TEMPLATE_PATH, 'rule-doc.hbs')
    },
    {
        destination: path.join(destination, 'package.json'),
        path: path.join(__dirname, TEMPLATE_PATH, 'rule-package.hbs')
    },
    {
        destination: path.join(destination, 'src', `index.ts`),
        path: path.join(__dirname, TEMPLATE_PATH, 'rule-index.hbs')
    }];

    const ruleFile = {
        destination: path.join(destination, 'src'),
        path: path.join(__dirname, TEMPLATE_COMMON_PATH, 'rule-script.hbs')
    };
    const testFile = {
        destination: path.join(destination, 'tests'),
        path: path.join(__dirname, TEMPLATE_COMMON_PATH, 'rule-test.hbs')
    };

    for (const file of commonFiles) {
        const { destination: dest, path: p } = file;

        const fileContent = await compileTemplate(p, data);

        await mkdirpAsync(path.dirname(dest));
        await writeFileAsync(dest, fileContent);
    }

    for (const rule of data.rules) {
        const [ruleContent, testContent] = await Promise.all([compileTemplate(ruleFile.path, rule), compileTemplate(testFile.path, rule)]);

        // e.g.: rule-ssllabs/src/ssllabs.ts
        const rulePath = path.join(ruleFile.destination, `${rule.normalizedName}.ts`);
        // e.g.: rule-ssllabs/tests/ssllabs.ts
        const testPath = path.join(testFile.destination, `${rule.normalizedName}.ts`);

        await Promise.all([mkdirpAsync(path.dirname(rulePath)), mkdirpAsync(path.dirname(testPath))]);

        await Promise.all([writeFileAsync(rulePath, ruleContent), writeFileAsync(testPath, testContent)]);
    }
};

const normalizeData = (results: inquirer.Answers) => {
    const normalizedName = normalize(results.name, '-');

    if (!results.multi) {
        results.rules.push(results);
    }

    const newData = Object.assign({}, results, {
        description: escapeSafeString(results.description),
        normalizedName, // occurences of the name in md and ts files
        packageMain: `dist/src/index.js`, // package.json#main
        packageName: `@sonarwhal/rule-${normalizedName}`, // package.json#name
        rules: [],
        version: sonarwhalPackage.version
    });

    results.rules.forEach((rule) => {
        newData.rules.push(new NewRule(rule, QuestionsType.externalRule));
    });

    return newData;
};

/** Removes an existing rule files and any references in the documentation. */
export const newExternalRule = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.newRule || packageDir === processDir) {
        return false;
    }

    try {
        const results = await inquirer.prompt(questions(QuestionsType.external));
        const rules = [];

        const askRules = async () => {
            const rule = await inquirer.prompt(questions(QuestionsType.externalRule));

            rules.push(rule);

            if (rule.again) {
                await askRules();
            }
        };

        if (results.multi) {
            await askRules();
        }

        if (!results.name) {
            throw new Error(`${results.multi ? 'Package' : 'Rule'} name can't be empty.`);
        }

        results.rules = rules;

        const data = normalizeData(results);
        const destination: string = path.join(processDir, `rule-${data.normalizedName}`);

        await copyCommonFiles(destination);
        await generateRuleFiles(destination, data);

        logger.log(`
New ${data.multi ? 'package' : 'rule'} ${data.name} created in ${destination}

--------------------------------------
----          How to use          ----
--------------------------------------
1. Go to the folder rule-${data.normalizedName}
2. Run 'npm run init' to install all the dependencies and build the project
3. Run 'npm run sonarwhal -- https://YourUrl' to analyze you site
`);

        return true;
    } catch (e) {
        logger.error('Error trying to create new rule');
        logger.error(e);

        return false;
    }
};
