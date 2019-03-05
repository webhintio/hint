/* eslint-disable no-process-env */
import { authenticate } from '../lib/git-helpers';
import { GitHubAuth, Context } from '../@types/custom';
import { ListrTaskWrapper } from 'listr';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

export const authenticateGitHub = (ctx: Context, task: ListrTaskWrapper) => {
    if (process.env.GITHUB_TOKEN) {
        return authenticate({ token: process.env.GITHUB_TOKEN });
    }

    const questions = [{
        message: 'GitHub username:',
        name: 'user',
        type: 'input'
    }, {
        message: 'GitHub password:',
        name: 'pass',
        type: 'password'
    }, {
        message: 'GitHub OTP:',
        name: 'otp',
        type: 'input'
    }];

    return inquirer(questions, (answers: import('inquirer').Answers) => {
        return authenticate(answers as GitHubAuth)
            .catch((e) => {
                return task.run();
            });
    });
};
