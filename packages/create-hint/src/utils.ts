import { packages } from '@hint/utils';

const { findPackageRoot } = packages;

/** Returns an object that represents the `package.json` version of `create-hint` */
export const loadCreateHintPackage = () => {
    // webpack will embed the package.json
    /* istanbul ignore if */
    if (process.env.webpack) { // eslint-disable-line no-process-env
        return require('../package.json');
    }

    const pkgRoot = findPackageRoot(__dirname, 'package.json');

    return require(`${pkgRoot}/package.json`);
};
