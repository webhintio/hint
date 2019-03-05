import * as path from 'path';
import * as fs from 'fs-extra';

import { debug, packageTask } from '../lib/utils';

export const cleanWorkspace = () => {

    /**
     * Get npm credentials first? Return another task?
     */
    return packageTask(async (pkg, observer) => {
        if (pkg.updated) {
            const message = `Cleaning ${pkg.name}`;

            debug(message);
            observer.next(message);

            const pkgBasedir = path.dirname(pkg.path);

            await Promise.all([
                fs.remove(path.join(pkgBasedir, 'dist')),
                fs.remove(path.join(pkgBasedir, 'node_modules'))
            ]);
        }
    });
};
