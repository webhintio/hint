import { Context } from '../@types/custom';
import { commitChanges } from '../lib/git-helpers';

/**
 * Commits the changes in all the packages with one commit per package.
 * @param ctx The Listr Context
 */
export const commitPackagesChanges = async (ctx: Context) => {
    await commitChanges('Chore: Update dependencies and package version');
};
