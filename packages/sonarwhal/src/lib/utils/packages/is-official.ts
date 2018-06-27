import { join } from 'path';

import findPackageRoot from './find-package-root';
import readFile from '../fs/read-file-async';

/**
 * Returns if the rule that is going to be created is an official.
 *
 * To do this we search the first `package.json` starting in `porcess.cwd()`
 * and go up the tree. If the name is `sonarwhal` then it's an official one.
 * If not or no `package.json` are found, then it isn't.
 */
export default async (): Promise<boolean> => {
    try {
        const pkg = JSON.parse(await readFile(join(findPackageRoot(process.cwd()), 'package.json')));

        return pkg.name === '@sonarwhal/monorepo';
    } catch (e) {
        // No `package.json` was found, so it's not official
        return false;
    }
};
