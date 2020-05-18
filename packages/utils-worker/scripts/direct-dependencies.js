const pkg = require('../package.json');

/**
 * @param {string} name
 */
const isHintPackage = (name) => {
    return name === 'hint' || name.startsWith('@hint/');
};

/**
 * @param {Set<*>} to
 * @param {Set<*>} from
 */
const mergeIntoSet = (to, from) => {
    for (const item of from) {
        to.add(item);
    }
};

/**
 * @param {string} module
 */
const getModuleDependencies = (module) => {
    const dependencies = new Set();
    const modulePackage = require(`${module}/package.json`);

    for (const dependency of Object.keys(modulePackage.dependencies || {})) {
        if (isHintPackage(dependency)) {
            mergeIntoSet(dependencies, getModuleDependencies(dependency));
        } else {
            dependencies.add(dependency);
        }
    }

    return dependencies;
};

const main = () => {
    const dependencies = new Set();

    const webhintModules = Object.keys(pkg.devDependencies).filter(isHintPackage);

    for (const module of webhintModules) {
        mergeIntoSet(dependencies, getModuleDependencies(module));
    }

    const sortedDependencies = Array.from(dependencies).sort();

    console.log('Top-level Dependencies:');
    for (const dependency of sortedDependencies) {
        if (!dependency.startsWith('@types/')) {
            console.log(dependency);
        }
    }
};

main();
