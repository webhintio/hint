import { promisify } from 'util';
import * as locker from 'lockfile';
import * as puppeteer from 'puppeteer-core';

import { chromiumFinder, debug as d, fs, misc } from '@hint/utils';

const debug: debug.IDebugger = d(__filename);

const lockFile = promisify(locker.lock) as (path: string, options: locker.Options) => Promise<void>;
const unlockFile = promisify(locker.unlock);
const lockName = 'chromium-connector.lock';
let isLocked = false;

const { readFileAsync, writeFileAsync } = fs;
const { delay } = misc;

const pidFile = 'chromium.pid';
const executablePath = chromiumFinder.getInstallationPath();

debug(`Chromium executable: ${executablePath}`);

type BrowserInfo = {
    browserWSEndpoint: string;
    pid: number;
}

const lock = async () => {
    try {
        debug(`Trying to acquire lock`);
        await lockFile(lockName, {
            pollPeriod: 500,
            retries: 20,
            retryWait: 1000,
            stale: 50000,
            wait: 50000
        });
        isLocked = true;
        debug(`Lock acquired`);
    } catch (e) {
        /* istanbul ignore next */
        { // eslint-disable-line
            debug(`Error while locking`, e);

            throw e;
        }
    }
};

const unlock = async () => {
    if (isLocked) {
        debug(`Trying to unlock`);
        await unlockFile(lockName);
        debug(`Unlock successful`);
    } else {
        debug(`No need to unlock`);
    }
};

/** If a browser is already running, it returns its pid. Otherwise return value is -1.  */
const getBrowserInfo = async () => {
    let result = {
        browserWSEndpoint: '',
        pid: -1
    };

    try {
        result = JSON.parse(await readFileAsync(pidFile));
    } catch (e) {
        /* istanbul ignore next */
        { // eslint-disable-line
            debug(`Error reading ${pidFile}`);
            debug(e);

            return null;
        }
    }

    /* istanbul ignore if */
    if (Number.isNaN(result.pid)) {
        return null;
    }

    try {
        /*
         * We test if the process is still running or if it is a leftover:
         * https://nodejs.org/api/process.html#process_process_kill_pid_signal
         */
        /*
         * When running tests serially (because we mock a dependency),
         * sometimes the connector tries to connect to a browser that
         * is being closed and the connection fails. We wait a few
         * milliseconds to make sure this doesn't happen. The number
         * is by trial and error.
         */
        await delay(400);

        process.kill(result.pid, 0);
    } catch (e) {
        /* istanbul ignore next */
        { // eslint-disable-line
            debug(`Process with ${result.pid} doesn't seem to be running`);

            return null;
        }
    }

    return result;
};

/** Stores the `pid` of the given `child` into a file. */
const writePid = async (browserInfo: BrowserInfo) => {
    /* istanbul ignore next */
    await writeFileAsync(pidFile, JSON.stringify(browserInfo, null, 4));
};

// Accept some options here
export const launch = async () => {
    await lock();

    const currentInfo = await getBrowserInfo();

    if (currentInfo) {
        // TODO: Options here
        const browser = await puppeteer.connect({ browserWSEndpoint: currentInfo.browserWSEndpoint });

        debug(`Creating new page`);
        const page = await browser.newPage();

        await unlock();

        return { browser, page };
    }

    // TODO: Merge options here
    const browser = await puppeteer.launch({
        executablePath,
        headless: false
    });

    debug(`Creating new page`);
    const page = await browser.newPage();

    const pid = browser.process().pid;
    const browserWSEndpoint = browser.wsEndpoint();

    try {
        const browserInfo = {
            browserWSEndpoint,
            pid
        };

        await writePid(browserInfo);

        debug('Browser launched correctly');

        await unlock();

        return { browser, page };
    } catch (e) {
        /* istanbul ignore next */
        { // eslint-disable-line
            debug('Error launching browser');
            debug(e);

            await unlock();

            throw e;
        }
    }
};

export const close = async (browser: puppeteer.Browser, page: puppeteer.Page) => {
    // Do magic here around closing or not
    await lock();

    try {
        await page.close();

        const targets = await browser.targets();
        const pageTargets = targets.filter((target) => {
            return target.type() === 'page';
        });

        if (pageTargets.length === 0) {
            await browser.close();
        } else {
            await browser.disconnect();
        }
    } catch (e) {
        debug(`Error closing browser`);
    } finally {
        await unlock();
    }
    // this._page.disconnect();
};
