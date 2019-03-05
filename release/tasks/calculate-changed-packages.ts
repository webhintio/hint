import { Context } from '../@types/custom';
import { getCommitsSinceLastRelease } from '../lib/git-helpers';

/** Generates a list with all the changed packages since their last release. */
export const calculateChangedPackages = (ctx: Context): Promise<void | void[]> => {
    const changes: Promise<void>[] = [];

    for (const [, pkg] of ctx.packages) {
        changes.push(getCommitsSinceLastRelease(pkg)
            .then((commits) => {
                pkg.commits = commits;
            }));
    }

    return Promise.all(changes);
};
