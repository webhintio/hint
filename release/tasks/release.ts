import * as path from 'path';
import { Package, Context } from '../@types/custom';
import { debug, execa, packageTask } from '../lib/utils';

const inquirer = require('listr-inquirer'); // `require` used because `listr-inquirer` exports a function

const buildForRelease = async (pkg: Package) => {
    const scripts = ['build-release', 'build'];
    const npmScript = scripts.reduce((cmd, script) => {
        if (cmd) {
            return cmd;
        }
        if (pkg.content.scripts.hasOwnProperty(script)) {
            return script;
        }

        return cmd;
    }, '');

    if (npmScript === '') {
        // Nothing to build
        return;
    }

    const command = `npm run ${npmScript}`;

    await execa(command, { cwd: path.dirname(pkg.path) });
};

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

            let message = `Bulding ${pkg.name} for release`;

            debug(message);
            observer.next(message);

            await buildForRelease(pkg);

            const dryRun = ctx.argv.dryRun ?
                ' --dry-run' :
                '';

            message = `Publishing ${pkg.name}`;

            debug(message);
            observer.next(message);

            const { stdout } = await execa(`npm publish --access public${dryRun}`, { cwd: path.dirname(pkg.path) });

            debug(stdout);
        } else {
            debug(`Skipping ${pkg.name} from publishing, published version "${pkg.publishedVersion}" matches local one`);
        }
    });
};
