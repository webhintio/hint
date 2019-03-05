/* eslint-disable no-process-env */
import { deauthenticate } from '../lib/git-helpers';
import { Context } from '../@types/custom';
import { ListrTaskWrapper } from 'listr';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

let tries = 3;

export const deauthenticateGitHub = (ctx: Context, task: ListrTaskWrapper) => {
    if (process.env.GITHUB_TOKEN) {
        return 'Token is a variable';
    }

    const questions = [{
        message: 'GitHub OTP:',
        name: 'otp',
        type: 'input'
    }];

    return inquirer(questions, (answers: import('inquirer').Answers) => {
        return deauthenticate(answers.otp)
            .catch((e) => {
                tries--;

                if (tries > 0) {
                    return task.run();
                }
                ctx.error = e;

                throw e;
            });
    });
};
