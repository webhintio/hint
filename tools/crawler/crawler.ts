/* eslint-disable no-process-exit */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { promisify } from 'util';
import { fork, ChildProcess } from 'child_process';

import { debug as d } from '../../src/lib/utils/debug';
import * as logger from '../../src/lib/utils/logging';

const readFileAsync = promisify(fs.readFile);
const debug: debug.IDebugger = d(__filename);
const MAX_WORKERS = 10;
let urls: Array<string>;
let totalSites: number;
let errorsProcessing = false;

/**
 * Kill a given process.
 */
const killProcess = (runner: ChildProcess) => {
    try {
        runner.kill('SIGKILL');
    } catch (err) {
        logger.error('Error closing sonar process');
    }
};

/**
 * Create a child process to run sonar.
 */
const runSonar = (): Promise<void> => {
    return new Promise((resolve) => {
        // if we don't set execArgv to [], when the process is created, the execArgv
        // has the same parameters as his father so if we are debugging, the child
        // process try to debug in the same port, and that throws an error.
        const url = urls.pop();
        const runner: ChildProcess = fork(path.join(__dirname, '..', '..', 'src', 'bin', 'sonar'), [url, '-c', path.join(__dirname, '.sonarrc')], { execArgv: [] });
        let timeoutId: NodeJS.Timer;

        logger.log(`Analyzing site ${totalSites - urls.length}/${totalSites}: ${url}`);

        runner.once('exit', async (code: number, signal: string) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            if (signal === 'SIGKILL') {
                logger.error(`Error runing url: ${url}. Process timed out`);
            } else if (code !== 0) {
                logger.error(`Error runing url: ${url}. Exit code: ${code}`);
                errorsProcessing = true;
            }

            // We check if there are more urls to process
            if (urls.length > 0) {
                await runSonar();
            }

            resolve();
        });

        timeoutId = setTimeout(() => {
            debug(`Job with url: ${url} timeout. Killing process`);
            killProcess(runner);
        }, 180000);
    });
};


/**
 * Read the list of sites
 */
const readSiteList = async (fileName): Promise<void> => {
    const content: string = await readFileAsync(fileName, 'utf-8');

    urls = content.trim()
        .split('\n')
        .reduce((valids, entry) => {
            try {
                let url = entry.trim();

                if (!url.startsWith('http')) {
                    url = `http://${entry}`;
                }

                new URL(url); // eslint-disable-line no-new

                valids.push(url);
            } catch (e) {
                logger.error(`${entry} is not valid`);
            }

            return valids;
        }, []);

    totalSites = urls.length;
};

const run = async () => {
    // read CLI to know what file to read
    const start = Date.now();

    try {
        // `node crawler urlsFile`
        logger.log('Reading list of urls');
        await readSiteList(process.argv[2]);
    } catch (e) {
        logger.error(`Error reading the file with the urls`);
        logger.error(e);

        process.exit(1);
    }

    const totalWorkers = parseInt(process.argv[3]) || MAX_WORKERS;

    logger.log(`Total sites: ${totalSites}`);
    logger.log(`Workers to process: ${totalWorkers}`);
    logger.log('Starting the process');

    const workers: Array<Promise<void>> = [];

    while (workers.length < totalWorkers) {
        workers.push(runSonar());
    }

    await Promise.all(workers);

    const now = Date.now();

    logger.log('All urls processed');
    logger.log(`Total time: ${(now - start) / 1000}secs`);

    if (errorsProcessing) {
        process.exitCode = 1;
    }
};

run();
