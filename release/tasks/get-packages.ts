import * as path from 'path';

import * as globby from 'globby';
import latest from 'latest-version';

import { Context, Reference } from '../@types/custom';
import { debug } from '../lib/utils';

/** Loads all the references of a `tsconfig.json` file to resolve dependencies. */
const loadReferences = (route: string): string[] => {
    try {
        const tsconfig = require(path.resolve(process.cwd(), route));

        const references = tsconfig.references ?
            tsconfig.references.map((reference: Reference) => {
                return reference.path;
            }) :
            [];

        return references;
    } catch (e) {
        return [];
    }
};

const shouldBeIgnored = (destination: string, ignoredPackages: string[]) => {
    return ignoredPackages.some((ignoredPkg) => {
        return destination.includes(ignoredPkg);
    });
};

/**
 * Populate the context with all the valid packages to process. Packages
 * listed in `ignoredPackages` or with the field `"private": true`
 * in their `package.json` will have the property `ignore: true`
 */
export const getPackages = (ignoredPackages: string[]) => {
    return async (ctx: Context) => {
        debug(`Loading packages`);
        ctx.packages = new Map();

        const ignored = ignoredPackages.map((pkg) => {
            return path.join(process.cwd(), 'packages', pkg);
        });

        const pkgPaths = await globby([
            'packages/**/*/package.json',
            '!**/*/fixtures'
        ], { gitignore: true });

        const pathToName: Map<string, string> = new Map();

        pkgPaths.forEach((pkgPath) => {
            const destination = path.join(process.cwd(), pkgPath);
            const content = require(destination);

            const references = loadReferences(destination.replace('package.json', 'tsconfig.json'))
                .map((reference) => {
                    /**
                     * The references are relative and we just need the last part
                     * of the path to do the matchin later. E.g: connector-puppeteer
                     */
                    return reference.split('/').pop()!;
                });

            // `pkgPath` returned by `globby` always uses `/`
            const key = path
                .dirname(pkgPath)
                .split('/')
                .pop()!;

            pathToName.set(key, content.name);

            const ignore = content.private || shouldBeIgnored(destination, ignored);

            ctx.packages.set(content.name, {
                commits: [],
                content,
                ignore,
                name: content.name,
                oldVersion: content.version,
                path: destination,
                publishedVersion: '',
                references,
                tested: false,
                updated: false
            });

            if (ignore) {
                debug(`Package ${content.name} will be ignored (${content.private ? 'private': 'manually ignored'})`);
            }
        });

        /**
         * Replace the references with the package names so it's easier to access
         * them later via `ctx.packages`.
         * Get the latest published version if any.
         */
        for (const [, pkg] of ctx.packages) {
            pkg.references = pkg.references.map((reference) => {
                return pathToName.get(reference)!;
            });

            try {
                pkg.publishedVersion = await latest(pkg.name);
            } catch (e) {
                debug((e as Error).message);
                debug(`Package ${pkg.name} is not published on npm`);
                pkg.publishedVersion = '';
            }
        }

        debug(`Total packages: ${ctx.packages.size}`);
    };
};
