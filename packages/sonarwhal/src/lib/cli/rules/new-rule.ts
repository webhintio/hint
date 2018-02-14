import * as path from 'path';
import { promisify } from 'util';

import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as mkdirp from 'mkdirp';

import { CLIOptions } from '../../types';
import * as logger from '../../utils/logging';
import { findPackageRoot, writeFileAsync } from '../../utils/misc';
import {
    processDir, questions, normalize,
    QuestionsType, NewRule
} from './common';
import { escapeSafeString, compileTemplate, sonarwhalPackage } from '../../utils/handlebars';

const mkdirpAsync = promisify(mkdirp);
/** Name of the package to use as a template. */
const TEMPLATE_PATH = './templates/new-rule';

/** Copies the required files for no official rules. */
const copyExternalFiles = async (destination: string) => {
    const commonFilesPath: string = path.join(__dirname, '..', 'external-files');

    logger.log(`Creating new rule in ${destination}`);
    await fs.copy(commonFilesPath, destination);
    logger.log('External files copied');
};

const generateRuleFiles = async (destination: string, data) => {
    const commonFiles = [
        {
            destination: path.join(destination, 'CHANGELOG.md'),
            path: path.join(__dirname, TEMPLATE_PATH, 'CHANGELOG.md')
        },
        {
            destination: path.join(destination, 'src', `index.ts`),
            path: path.join(__dirname, TEMPLATE_PATH, 'index.ts.hbs')
        },
        {
            destination: path.join(destination, 'LICENSE.txt'),
            path: path.join(__dirname, TEMPLATE_PATH, 'LICENSE.txt')
        },
        {
            destination: path.join(destination, 'package.json'),
            path: path.join(__dirname, TEMPLATE_PATH, 'package.json.hbs')
        },
        {
            destination: path.join(destination, 'README.md'),
            path: path.join(__dirname, TEMPLATE_PATH, 'readme.md.hbs')
        },
        {
            destination: path.join(destination, 'tsconfig.json'),
            path: path.join(__dirname, TEMPLATE_PATH, 'tsconfig.json.hbs')
        }];

    if (!data.official) {
        commonFiles.push({
            destination: path.join(destination, '.sonarwhalrc'),
            path: path.join(__dirname, TEMPLATE_PATH, '.sonarwhalrc.hbs')
        });
    }

    const ruleFile = {
        destination: path.join(destination, 'src'),
        path: path.join(__dirname, TEMPLATE_PATH, 'rule.ts.hbs')
    };
    const testFile = {
        destination: path.join(destination, 'tests'),
        path: path.join(__dirname, TEMPLATE_PATH, 'tests.ts.hbs')
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

    const prefix = results.official ? '@sonarwhal/' : 'sonarwhal-';

    const newData = Object.assign({}, results, {
        description: escapeSafeString(results.description),
        normalizedName, // occurences of the name in md and ts files
        official: results.official,
        packageMain: `dist/src/index.js`, // package.json#main
        packageName: `${prefix}rule-${normalizedName}`, // package.json#name
        rules: [],
        version: sonarwhalPackage.version
    });

    results.rules.forEach((rule) => {
        newData.rules.push(new NewRule(rule));
    });

    return newData;
};

/**
 * Returns if the rule that is going to be created is an official.
 *
 * To do this we search the first `package.json` starting in `porcess.cwd()`
 * and go up the tree. If the name is `sonarwhal` then it's an official one.
 * If not or no `package.json` are found, then it isn't.
 */
const isOfficial = (): Boolean => {
    try {
        const pkg = fs.readJSONSync(path.join(findPackageRoot(processDir), 'package.json')); // eslint-disable-line no-sync

        return pkg.name === '@sonarwhal/monorepo';
    } catch (e) {
        // No `package.json` was found, so it's not official
        return false;
    }
};

/** Add a new rule. */
export const newRule = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.newRule) {
        return false;
    }

    try {
        const results = await inquirer.prompt(questions(QuestionsType.external));
        const rules = [];

        results.official = isOfficial();

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

        results.rules = rules;

        const data = normalizeData(results);
        const destination: string = path.join(processDir, `rule-${data.normalizedName}`);

        if (!data.official) {
            await copyExternalFiles(destination);
        }
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
        /* istanbul ignore next */
        logger.error('Error trying to create new rule');
        logger.error(e);

        return false;
    }
};
