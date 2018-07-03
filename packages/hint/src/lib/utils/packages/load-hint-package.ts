import findPackageRoot from './find-package-root';

/** Returns an object that represents the `package.json` version of `hint` */
export default () => {
    // webpack will embed the package.json
    if (process.env.webpack) { // eslint-disable-line no-process-env
        return require('../../../../../package.json');
    }

    const pkgPath = findPackageRoot();

    return require(`${pkgPath}/package.json`);
};
