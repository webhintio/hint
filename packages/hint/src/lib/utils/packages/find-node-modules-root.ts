import { join } from 'path';

import findPackageRoot from './find-package-root';

/**
 * Find the node_modules folder where hint is installed as
 * a dependency or returns the hint node_modules folder if not.
 */
export default (dirname: string = __dirname): string => {
    const packageRoot = findPackageRoot(dirname);

    const nodeModulesPath = join(packageRoot, '..');

    /*
     * If hint is installed as a dependency
     * then we need to return the parent folder
     * i.e. c:\myproject\node_modules\hint -> c:\myproject\node_modules
     */
    if (nodeModulesPath.endsWith('node_modules')) {
        return nodeModulesPath;
    }

    /*
     * If we are using directly the hint project
     * then we need to return the node_modules folder
     * inside hint
     * i.e. c:\hint -> c:\hint\node_modules
     */
    return join(packageRoot, 'node_modules');
};
