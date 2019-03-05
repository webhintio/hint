import { Context } from '../@types/custom';
import { debug } from '../lib/utils';
import { push } from '../lib/git-helpers';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

/**
 * Prompts the user if changes should be pushed upstream
 * @param ctx The List Context
 */
export const pushChanges = (ctx: Context) => {

    if (ctx.argv.force) {
        return push();
    }

    const questions = [{
        message: 'Push changes upstream?',
        name: 'confirmation',
        type: 'confirm'
    }];

    return inquirer(questions, async (answers: any) => {
        if (!answers.confirmation) {
            debug(`User rejected push`);

            ctx.error = new Error('User rejected publishing changes upstream');
        } else {
            debug(`Push approved`);
            await push();
        }
    });
};
