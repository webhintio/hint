const fs = require('fs');
const path = require('path');
const globby = require('globby');


const packagesFiles = globby.sync([
    '**/*/package.json',
    '!**/*/fixtures'
], { gitignore: true });

const packages = new Map();
const dependsOn = new Map();

packagesFiles.forEach((pkgFile) => {
    const destination = path.join(process.cwd(), pkgFile);
    const pkg = require(destination);

    packages.set(pkg.name, pkg);

    const deps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.optionalDependencies || {})
    ].filter((name) => {
        return name.startsWith('@hint/');
    });

    const dependencies = new Set(deps);

    dependsOn.set(pkg.name, dependencies);
});

const isDependedBy = new Map();

dependsOn.forEach((dependencies, name) => {
    // console.log(name);

    if (dependencies.size > 0) {
        dependencies.forEach((dependency, index) => {
            const separator = index === dependencies.size - 1 ?
                '⨽' :
                '⊢';

            // console.log(`    ${separator} ${dependency}`);

            if (!isDependedBy.has(dependency)) {
                isDependedBy.set(dependency, new Set());
            }

            isDependedBy.get(dependency).add(name);
        });
    }

    // console.log('');
});

// console.log(`===============`);

const getPrefix = (index) => {
    let start = 0;
    let prefix = '';
    const spaceChar = '   |';

    while (start < index) {
        prefix += spaceChar;
        start++;
    }

    return prefix;
};

const printDependency = (dependency, index) => {
    const separator = '--';

    const prefix = getPrefix(index);

    console.log(`${prefix}${separator} ${dependency}`);
};

const printDependencies = (dependants, depth) => {
    dependants.forEach((dependant) => {

        printDependency(dependant, depth);

        if (isDependedBy.has(dependant)) {
            printDependencies(isDependedBy.get(dependant), depth + 1);
        }
    });
};

isDependedBy.forEach((dependants, name) => {
    console.log(name);

    printDependencies(dependants, 1);

});
