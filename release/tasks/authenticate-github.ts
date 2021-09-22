/* eslint-disable no-process-env */
import { authenticate } from '../lib/git-helpers';

export const authenticateGitHub = () => {
    if (process.env.GITHUB_TOKEN) {
        return authenticate({ token: process.env.GITHUB_TOKEN });
    }

    throw new Error('A GITHUB_TOKEN environment variable with repo scope must be provided');
};
