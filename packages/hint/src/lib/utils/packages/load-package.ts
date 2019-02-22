/**
 * Returns the package found in the given `pathString` or an
 * exception if no package is found
 */
export default (pathString: string) => require(`${pathString}/package.json`);
