import * as path from 'path';

import * as globby from 'globby';
import * as fs from 'fs-extra';

import { Context, Package } from '../@types/custom';
import { readFile } from '../lib/utils';

const ignorePrefixes = ['hint', '@hint/configuration-', '@hint/connector-chrome', 'create-', '@hint/utils'];

const ignorePackage = (pkg: Package): boolean => {
    if (pkg.ignore) {
        return true;
    }

    return ignorePrefixes.some((prefix) => {
        return pkg.name.startsWith(prefix);
    });
};

const isHint = (pkg: Package): boolean => {
    return pkg.name.startsWith('@hint/hint-');
};

const isParser = (pkg: Package): boolean => {
    return pkg.name.startsWith('@hint/parser-');
};

const getHints = async (pkg: Package) => {
    const hints: any = {};

    const metasPromises = (await globby(['src/meta.ts', 'src/meta/*.ts'], {
        absolute: true,
        cwd: path.join(pkg.path, '..')
    })).map((meta) => {
        return readFile(meta);
    });

    const metas = await Promise.all(metasPromises);

    for (const meta of metas) {
        const hintIdRegex = /id:\s*'([^']*)'/;
        const id = meta.match(hintIdRegex);

        if (id) {
            hints[id[1]] = 'error';
        }
    }

    return hints;
};

/**
 * Bumps the version of each package:
 *
 * 1. Load current `configuration-all` package.
 * 2. Load current `index.json`.
 * 3. Clean current dependencies in `package.json`.
 * 4. Clean current hints and parsers in `index.json`.
 * 5. Add packages to `package.json` and rules to `index.json`.
 * 6. Save `index.json`.
 */
export const updateConfigurationAll = async (ctx: Context) => {
    const { packages } = ctx;

    const pkgConfigAll = packages.get('@hint/configuration-all')!;
    const indexPath = path.join(pkgConfigAll.path, '..', 'index.json');

    // Step 1: Load current `configuration-all` package.
    const configAll = pkgConfigAll.content;
    // Step 2: Load current `index.json`
    const index = require(indexPath);

    // Step 3: Clean current dependencies.
    configAll.dependencies = {};
    // Step 4: Clean current hints and parsers in `index.json`.
    index.hints = {};
    index.parsers = [];

    // Step 5: Add packages to `package.json` and rules to `index.json`.
    for (const [, pkg] of packages) {
        // Ignore private packages
        if (ignorePackage(pkg)) {
            continue;
        }

        configAll.dependencies[pkg.name] = `^${pkg.content.version}`;

        if (isHint(pkg)) {
            const hints = await getHints(pkg);

            index.hints = { ...index.hints, ...hints };
        }

        if (isParser(pkg)) {
            index.parsers.push(pkg.name.replace('@hint/parser-', ''));
        }
    }

    // Step 6: Save `index.json`.
    await fs.writeFile(indexPath, `${JSON.stringify(index, null, 4)}\n`, 'utf-8');
};
