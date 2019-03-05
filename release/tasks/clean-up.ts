import { Context } from '../@types/custom';
import { debug, execa } from '../lib/utils';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

/**
 * Restores the workspace to the initial status
 * @param ctx The Listr Context
 */
export const cleanUp = (ctx: Context) => { // eslint-disable-line consistent-return
    if (ctx.error) {
        debug(`Exception during the execution:`);
        debug(JSON.stringify(ctx.error, Object.getOwnPropertyNames(ctx.error), 2));
    }

    if (ctx.error || ctx.abort) {

        // Maybe the requirements aren't OK so no SHA is available
        if (ctx.sha) {
            const questions = [{
                message: 'Revert to initial state?',
                name: 'revert',
                type: 'confirm'
            }];

            return inquirer(questions, async (answers: import('inquirer').Answers) => {
                if (answers.revert) {

                    debug('Reverting changes');
                    await execa(`git reset --hard ${ctx.sha}`);
                } else {
                    debug(`User decided not to revert`);
                }
            });
        }

        debug(`No SHA available, can't revert back`);
    }
};
