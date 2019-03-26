import { packages } from '@hint/utils';

const { findPackageRoot } = packages;

/** Returns an object that represents the `package.json` version of `hint` */
export const loadHintPackage = () => {
    // webpack will embed the package.json
    /* istanbul ignore if */
    if (process.env.webpack) { // eslint-disable-line no-process-env
        return require('../../../../hint/package.json');
    }

    const pkgPath = findPackageRoot(__dirname);

    return require(`${pkgPath}/package.json`);
};
