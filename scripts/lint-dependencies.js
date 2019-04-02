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
    'estree',
    'request'
]);

const getPackages = async () => {
    const pkgs = await globby(['packages/*'], {
        absolute: true,
        gitignore: true,
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

const getCodeContent = async (pkgPath) => {
    const files = await globby([
        `${pkgPath}/**/*.ts`,
        `${pkgPath}/**/*.tsx`,
        `${pkgPath}/**/*.js`,
        `${pkgPath}/**/*.jsx`,
        `!${pkgPath}/**/*.d.ts`,
        `!${pkgPath}/dist/**/*`,
        `!${pkgPath}/node_modules/**/*` // needed when we are inside a package like extension-vscode
    ], { gitignore: true });

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
    const regexps = [
        /import\s+.*?\s+'([a-z0-9_-]+)';/gi, // `import * as something from 'something';`
        /import\('([a-z0-9_-]+)'\)/gi, // `import('something');`
        /require\('([a-z0-9_-]+)'\);/gi // `const something = require('something');`
    ];

    regexps.forEach((regex) => {
        let match;

        while ((match = regex.exec(content)) !== null) {
            const [, dependency] = match;

            /**
             * Only the first part of the dependecy is needed:
             * E.g.: `import * from 'hint/dist/src/types'`
             *        `hint`
             */
            const root = dependency.split('/').shift();

            if (!dependencies.has(root) && !(typeDependencies.has(root) && dependencies.has(`@types/${root}`))) {
                missingDependencies.add(root);
            }
        }
    });

    return missingDependencies;
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

    for (const [filePath, content] of files) {

        const missingDependencies = processFile(content, dependencies);

        if (missingDependencies.size > 0) {
            console.error(`\t${filePath}`);
            missingDependencies.forEach((dependency) => {
                console.error(`\t\t${dependency}`);
            });

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
};

init();
