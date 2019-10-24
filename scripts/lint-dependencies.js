/**
 * This script finds all the `import` and `require` of a packages
 * and checks that there's a dependency for each one of them in
 * the `package.json`.
 */

const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const builtIn = require('builtin-modules');

const typeDependencies = new Set([
    'har-format',
    'estree-jsx',
    'request',
    'tough-cookie',
    'vscode'
]);

const ignoredDependencies = new Set([
    '@hint/configuration-development',
    '@hint/configuration-web-recommended',
    '@hint/connector-local',
    '@hint/utils-tests-helpers',
    '@types/chrome',
    '@types/node',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'ava',
    'canvas',
    'cpx',
    'eslint',
    'eslint-plugin-import',
    'eslint-plugin-markdown',
    'eslint-plugin-react-hooks',
    'npm-run-all',
    'nyc',
    'rimraf',
    'typescript',
    'typed-css-modules',
    'vsce',
    'vscode-languageclient',
    'web-ext',
    'webpack',
    'webpack-cli',
    ...builtIn
]);

const regexps = [
    /import[\s\w\d{},*]*?'([a-z0-9_\-@/.]+)';/gi, // `import * as something from 'something';`
    /import\('([a-z0-9_\-@/.]+)'\)/gi, // `import('something');`
    /require(?:\.resolve)?\('([a-z0-9_\-@/.]+)'\)/gi, // `const something = require('something');` || `const something = require.resolve('something');`
    /(?:loader|use):\s+'([a-z0-9_\-@/.]+)'/gi, // webpack config: `loader: 'ts-loader'` `use: 'raw-loader'`
    /use:\s+\[?\s*'([a-z0-9_\-@/.]+)'/gmi // webpack config, `use` can accept an array
];

const getPackages = async () => {
    const pkgs = await globby(['packages/*'], {
        absolute: true,
        onlyFiles: false
    });

    console.log(`Packages found: ${pkgs.length}`);

    return pkgs;
};

const getDependencies = (pkg) => {
    const depArray = [
        ...builtIn,
        ...Object.keys(pkg.dependencies || []),
        ...Object.keys(pkg.devDependencies || []),
        ...Object.keys(pkg.peerDependencies || []),
        ...Object.keys(pkg.optionalDependencies || [])
    ];

    const dependencies = new Set(depArray);

    return dependencies;
};

const getCodeContent = async (rawPkgPath) => {
    const pkgPath = rawPkgPath.replace(/\\/g, '/');
    const files = await globby([
        `${pkgPath}/**/*.ts`,
        `${pkgPath}/**/*.tsx`,
        `${pkgPath}/**/*.js`,
        `${pkgPath}/**/*.jsx`,
        `!${pkgPath}/dist/**/*`,
        `!${pkgPath}/node_modules/**/*` // needed when we are inside a package like extension-vscode
    ], { gitignore: false });

    const contents = new Map();

    const readPromises = files.map((file) => {
        return fs.readFile(file, 'utf-8')
            .then((content) => {
                contents.set(file, content);
            });
    });

    await Promise.all(readPromises);

    return contents;
};

const processFile = (content, dependencies) => {
    const missingDependencies = new Set();

    regexps.forEach((regex) => {
        let match;

        while ((match = regex.exec(content)) !== null) {
            const [, dependency] = match;

            if (dependency.startsWith('.')) {
                continue;
            }

            /**
             * Only the first part of the dependecy is needed:
             * E.g.: `import * from 'hint/dist/src/types'`
             *       `hint`
             *
             * The exception are the scoped packages:
             * E.g.: `import * from '@hint/utils'`
             *       `@hint/utils`
             */


            const parts = dependency.split('/');
            const root = dependency.startsWith('@') ?
                `${parts[0]}/${parts[1]}` :
                parts[0];

            if (!dependencies.has(root) &&
                !(typeDependencies.has(root) && dependencies.has(`@types/${root}`)) &&
                !ignoredDependencies.has(root)
            ) {
                missingDependencies.add(root);
            }
        }
    });

    return missingDependencies;
};

/**
 *
 * @param {Map<string,string>} files
 */
const getPackageDependencies = (files) => {
    const usedDependencies = new Set();
    /**
     * special case for webhint configurations in tests:
     * `parsers: ['manifest', 'css', 'sass']`
     *
     * The RegExp will match all the content inside `[]`
     * so we will have to get the different parts later
     * and add them individually.
     */
    const parserRegex = /(parsers): \[([',\sa-z0-9]+)\]/gi;

    [...regexps, parserRegex].forEach((regex) => {
        let match;

        for (const [, content] of files) {
            while ((match = regex.exec(content)) !== null) {
                let [, dependency, extra] = match;

                // Especial handling of `parsers: ['manifest', 'css', 'sass']`
                if (dependency === 'parsers') {
                    extra = extra.replace(/'/g, '');
                    const extras = extra.split(',');

                    extras.forEach((dep) => {
                        dependency = `@hint/parser-${dep.trim()}`;
                        usedDependencies.add(dependency);
                    });
                } else {
                    const parts = dependency.split('/');

                    // E.g.: `@hint/utils/dist/src` --> `@hint/utils`
                    if (dependency.startsWith('@')) {
                        usedDependencies.add(`${parts[0]}/${parts[1]}`);
                    } else {
                        // E.g.: `hint/dist/src` --> `hint`
                        usedDependencies.add(parts[0]);
                    }
                }
            }
        }
    });

    return usedDependencies;
};

const processPackage = async (pkgPath) => {
    /**
     * 1. Load package.json and get the dependencies, devDependencies and peerDependencies
     * 2. Find all *.ts and *.js files ignoring node_modules
     * 3. For each file search all imports and requires
     * 4. Match content against dependencies
     */

    const pkgJsonPath = path.join(pkgPath, 'package.json');
    const pkg = require(pkgJsonPath);
    const dependencies = getDependencies(pkg);
    const files = await getCodeContent(pkgPath);

    if (files.size === 0) {
        console.log(`No files to process for "${pkgPath}"`);

        return;
    }

    console.log(`Processing "${pkgPath}"`);

    // Verify all require, import, etc. have a matching dependency
    for (const [filePath, content] of files) {

        const missingDependencies = processFile(content, dependencies);

        if (missingDependencies.size > 0) {
            missingDependencies.forEach((dependency) => {
                console.error(`\t${dependency} missing in ${filePath}`);
            });

            process.exitCode = 1;
        }
    }

    // Verify that all dependencies in `package.json` have a require, import, etc.
    const usedDependencies = getPackageDependencies(files);

    for (const dependency of dependencies) {
        const used = usedDependencies.has(dependency.replace('@types/', '')) || // required to find unnecessary types
            ignoredDependencies.has(dependency);

        if (!used) {
            console.error(`\t"${dependency}" is not necessary in ${pkgPath}/package.json`);
            process.exitCode = 1;
        }
    }
};

const init = async () => {

    /**
     * If running from the root need to lint all packages,
     * otherwise just the current package
     */
    const pkgs = process.cwd() === path.join(__dirname, '..') ?
        await getPackages() :
        [process.cwd()];

    for (const pkg of pkgs) {
        await processPackage(pkg);
    }

    if (process.exitCode) {
        console.error('Issues with depedendencies found. Please check output above.');
    } else {
        console.log('No dependency issues found.');
    }
};

init();
