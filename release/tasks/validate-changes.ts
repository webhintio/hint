import * as semver from 'semver';

import { Context } from '../@types/custom';
import { debug } from '../lib/utils';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

const delta = (oldVersion: string, newVersion: string): string => {
    const svOld = semver.parse(oldVersion)!;
    const svNew = semver.parse(newVersion)!;

    const dMajor = svNew.major - svOld.major;
    const dMinor = Math.max(0, svNew.minor - svOld.minor);
    const dPatch = Math.max(0, svNew.patch - svOld.patch);

    return `${dMajor}.${dMinor}.${dPatch}`;
};

/**
 * Prompts the user if the changes are correct
 * @param ctx The List Context
 */
export const validateChanges = (ctx: Context) => {

    let maxLength = 0;

    for (const [name] of ctx.packages) {
        maxLength = Math.max(name.length, maxLength);
    }

    const packages = [...ctx.packages.values()].sort((p1, p2) => {
        const d1 = delta(p1.oldVersion, p1.content.version);
        const d2 = delta(p2.oldVersion, p2.content.version);

        return semver.compare(d2, d1) || p1.name.localeCompare(p2.name);
    });

    for (const pkg of packages) {
        if (!pkg.ignore && (pkg.updated || !pkg.publishedVersion)) {
            debug(`${pkg.name.padEnd(maxLength)} ${pkg.oldVersion.padEnd(8)} ${pkg.content.version.padEnd(8)} (${semver.diff(pkg.oldVersion, pkg.content.version)})`);
        }
    }

    const questions = [{
        message: 'Do the new versions in "release.log" seem right?',
        name: 'confirmation',
        type: 'confirm'
    }];

    return inquirer(questions, (answers: any) => {
        if (!answers.confirmation) {
            debug(`User rejected changes`);

            ctx.abort = true;

            throw new Error('User rejected changes');
        } else {
            debug(`Changes approved`);
        }
    });
};
