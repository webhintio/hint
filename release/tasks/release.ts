import * as path from 'path';
import { Context } from '../@types/custom';
import { debug, execa, packageTask } from '../lib/utils';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

export const confirmRelease = (ctx: Context) => {
    const questions = [{
        message: 'Do you really want to publish packages on npm?',
        name: 'publish',
        type: 'confirm'
    }];

    return inquirer(questions, async (answers: import('inquirer').Answers) => { // eslint-disable-line

        if (!answers.publish) {
            debug(`User rejected changes`);

            ctx.abort = true;
        } else {
            debug(`Publishing approved`);
        }
    });
};

export const release = () => {

    return packageTask(async (pkg, observer, ctx) => {
        if (pkg.ignore) {
            debug(`Skipping ${pkg.name} from publishing as it is ignored`);

            return;
        }

        // In case we are doing just publishing because the process failed earlier
        if (pkg.publishedVersion !== pkg.content.version) {
            const dryRun = ctx.argv.dryRun ?
                ' --dry-run' :
                '';

            const message = `Publishing ${pkg.name}`;

            debug(message);
            observer.next(message);

            try {
                const { stdout } = await execa(`npm publish --access public${dryRun}`, { cwd: path.dirname(pkg.path) });

                debug(stdout);
            } catch (e) {
                debug((e as Error).message);
            }
        } else {
            debug(`Skipping ${pkg.name} from publishing, published version "${pkg.publishedVersion}" matches local one`);
        }
    });
};

export const releaseForBrowser = (url: string) => {
    return () => {
        const questions = [{
            choices: [{ name: url }],
            message: `Did you submit extension-browser?`,
            name: 'submitted',
            type: 'checkbox'
        }];

        return inquirer(questions, async (answers: import('inquirer').Answers) => { // eslint-disable-line
            if (!answers.submitted.length) {
                throw new Error(`Package not submitted`);
            }
        });
    };
};

export const releaseForVSCode = async (ctx: Context) => {
    const pkg = ctx.packages.get('vscode-webhint');

    if (!pkg) {
        throw new Error(`Package 'vscode-webhint' not found`);
    }

    const { stdout } = await execa(`vsce publish`, { cwd: path.dirname(pkg.path) });

    debug(stdout);
};

export const releaseForOVSX = async (ctx: Context) => {
    const pkg = ctx.packages.get('vscode-webhint');

    if (!pkg) {
        throw new Error(`Package 'vscode-webhint' not found`);
    }

    try {
        const { stdout } = await execa(`ovsx publish -p ${process.env.OVSX_TOKEN}`, { cwd: path.dirname(pkg.path) }); // eslint-disable-line no-process-env

        debug(stdout);
    } catch (e) {
        throw new Error(`Publishing for OVSX failed, no access token given.`);
    }
};
