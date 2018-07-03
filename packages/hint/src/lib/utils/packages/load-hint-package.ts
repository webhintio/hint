import findPackageRoot from './find-package-root';


/** Returns an object that represents the `package.json` version of `hint` */
export default () => {
    const pkgPath = findPackageRoot();
    const pkg = require(`${pkgPath}/package.json`);

    return pkg;
};
