import * as yargs from 'yargs';

export const argv = yargs
    .option('dryRun', {
        alias: 'd',
        describe: 'Use "npm publish --dry-run" to simulate npm publishing'
    })
    .option('force', {
        alias: 'f',
        describe: 'Accept all prompts'
    })
    .option('justRelease', {
        alias: 'r',
        describe: 'Publish to npm without running tests or publishing to GitHub'
    })
    .option('skipInstall', {
        alias: 's',
        describe: 'Skip "yarn" install process'
    })
    .version(false)
    .help()
    .argv;
