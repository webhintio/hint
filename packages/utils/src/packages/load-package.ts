/**
 * Returns the package found in the given `pathString` or an
 * exception if no package is found.
 */
export const loadPackage = (pathString: string) => {
    return require(`${pathString}/package.json`);
};
