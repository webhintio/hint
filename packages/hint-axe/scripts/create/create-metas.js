const spawn = require('child_process').spawn;
const globby = require('globby');
const chalk = require('chalk');

const { camelCase } = require('lodash');
const { categoryId, escapeKey, mkdir, rulesIn, writeFile } = require('./utils');

/** @typedef {import('axe-core').RuleMetadata} RuleMeta */

const dependencyMap = new Map();
dependencyMap.set('@hint/utils-types', '../../**/packages/utils-types/package.json');

/** Execute the `cmd` in a new process. */
const exec = (cmd) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.green(`  ${cmd}`));
        const command = spawn(cmd, [], {
            shell: true,
            stdio: 'inherit'
        });

        command.on('error', (err) => {
            return reject(err);
        });

        command.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error('NoExitCodeZero'));
            }

            return resolve(true);
        });

    });
};

/**
 * Searches 'packages/utils-types' and returns
 * an array with the path.
 * @returns { {packagePath: string}[] } The packages information
 */
const getPackages = async () => {
    /**
     * @type {Promise<string[]>[]}
     */
    const packagesToBuildPromise = [];
    const result = [];
    dependencyMap.forEach(async (value, key) => {
        // We only need to build the packages that has not been build yet,
        // so we require them and if it fails we build them. This also
        // guarantees we build them only once.
        try {
            await require(key);
        } catch (e) {
            packagesToBuildPromise.push(globby([value], { absolute: true}));
        }
    });

    const flattenedArray = (await Promise.all(packagesToBuildPromise)).flat()
    for (let packagePath of flattenedArray) {
        result.push({packagePath})
    }

    return result;
};

/**
 * Executes `yarn build` for the given package if present
 * @param { { packagePath: string, content: string } } pkg The package to test
 * @returns { Promise<boolean> } True if `yarn build` executed correctly
 * or if the package does not have that script.
 */
const prebuildPackage = async (pkg) => {
    if (pkg.packagePath) {
        console.log(chalk.green(`\tPrebuilding...`));
        const cwd = pkg.packagePath.replace('package.json', '');

        return await exec(`cd ${cwd} && yarn build`);
    }

    return true;
};

const prebuildPackages = async () => {
    const packages = await getPackages();
    let ok = true;

    for (const pkg of packages) {
        console.log(chalk.green.bold(`Processing "${pkg.packagePath}"`));
        ok = await prebuildPackage(pkg);

        if (!ok) {
            console.log(chalk.red.bold(`Error building package "${pkg.packagePath}"`));
        }
    }
};

/**
 * @param {string} category
 * @param {RuleMeta[]} rules
 */
const createMeta = async (category, rules) => {
    const id = categoryId(category);
    const { Severity } = await require('@hint/utils-types');
    const camelCaseId = camelCase(id);
    const rulesIds = rules.map((rule) => {
        return `'${rule.ruleId}'`;
    });
    const properties = rules.map((rule) => {
        const severities = Object.keys(Severity).filter((key) => {
            return isNaN(parseInt(key));
        });
        const quotedSeverities = severities.map((severity) => {
            return `'${severity}'`;
        });

        return `
                ${escapeKey(rule.ruleId)}: { enum: [${quotedSeverities.join(', ')}], type: 'string' }`;
    });

    const content = `// autogenerated by scripts/create/create-metas.js
import { Category } from '@hint/utils-types';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.accessibility,
        description: getMessage('${camelCaseId}_description', 'en'),
        name: getMessage('${camelCaseId}_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('${camelCaseId}_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('${camelCaseId}_name', language);
    },
    id: 'axe/${id}',
    schema: [
        {
            additionalProperties: false,
            properties: {${properties.join(',')}
            }
        },
        {
            items: {
                enum: [${rulesIds.join(', ')}],
                type: 'string'
            },
            typeof: 'array',
            uniqueItems: true
        }
    ],
    scope: HintScope.any
};

export default meta;
`;

    await writeFile(`src/meta/${id}.ts`, content);
};

/**
 * Generate a `./meta/*.ts` file containing the metadata for each
 * sub-hint. Then generate a `meta.ts` file referencing the metadata
 * for all sub-hints.
 *
 * @param {string[]} categories
 * @param {RuleMeta[]} rules
 */
const createMetas = async (categories, rules) => {
    await prebuildPackages();
    await mkdir('src/meta');

    for (const category of categories) {
        createMeta(category, rulesIn(category, rules));
    }

    const metas = categories.map((category) => {
        const id = categoryId(category);

        return `    ${escapeKey(id)}: require('./meta/${id}')`;
    });

    const content = `// autogenerated by scripts/create/create-metas.js
module.exports = {
${metas.join(',\n')}
};
`;

    await writeFile('src/meta.ts', content);
};

module.exports = { createMetas };
