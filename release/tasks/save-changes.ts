import { debug, updatePkgJson } from '../lib/utils';
import { Context } from '../@types/custom';

/** Saves in disk the changes to `package.json` of all packages */
export const savePackageChanges = (ctx: Context) => {
    debug('Saving files in disk');

    const writes: Promise<void>[] = [];

    for (const [, pkg] of ctx.packages) {
        writes.push(updatePkgJson(pkg));
    }

    return Promise.all(writes);
};
