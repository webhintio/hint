/**
 * @fileoverview Checks if yarn lockfile is present
 */

import { access } from 'fs';
import { join } from 'path';


export const hasYarnLock = (directory: string): Promise<boolean> => {
    return new Promise((resolve) => {
        access(join(directory, 'yarn.lock'), (err) => {
            resolve(!err);
        });
    });
};
