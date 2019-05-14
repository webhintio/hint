import { Context } from '../@types/custom';
import { debug } from '../lib/utils';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

/**
 * Prompts the user if the changes are correct
 * @param ctx The List Context
 */
export const validateChanges = (ctx: Context) => {

    let maxLength = 0;

    for (const [name] of ctx.packages) {
        maxLength = Math.max(name.length, maxLength);
    }

    for (const [, pkg] of ctx.packages) {
        if (!pkg.ignore && (pkg.updated || !pkg.publishedVersion)) {
            debug(`${pkg.name.padEnd(maxLength)} ${pkg.oldVersion.padEnd(8)} ${pkg.content.version}`);
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
