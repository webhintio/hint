import { promisify } from 'util';
import { unlink } from 'fs';

import * as locker from 'lockfile';
import * as puppeteer from 'puppeteer-core';

import { chromiumFinder, debug as d, fs } from '@hint/utils';

const debug: debug.IDebugger = d(__filename);

const deleteFile = promisify(unlink);
const lockFile = promisify(locker.lock) as (path: string, options: locker.Options) => Promise<void>;
const unlockFile = promisify(locker.unlock);
const lockName = 'chromium-connector.lock';
let isLocked = false;

const { readFileAsync, writeFileAsync } = fs;

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
        result = JSON.parse((await readFileAsync(pidFile)).trim());
    } catch (e) {
        /* istanbul ignore next */
        { // eslint-disable-line
            debug(`Error reading ${pidFile}`);
            debug(e);

            return null;
        }
    }

    return result;
};

const deletePid = async () => {
    try {
        await deleteFile(pidFile);
    } catch (e) {
        debug(`Error trying to delete ${pidFile}`);
        debug(e);
    }
};

/** Stores the `pid` of the given `child` into a file. */
const writePid = async (browserInfo: BrowserInfo) => {
    /* istanbul ignore next */
    await writeFileAsync(pidFile, JSON.stringify(browserInfo, null, 4));
};

// Accept some options here
export const launch = async (options: any) => {
    await lock();

    const ignoreHTTPSErrorsOption = options && options.overrideInvalidCert ?
        {
            // `ignoreHTTPSErrors` sometimes is not enough on headless: https://github.com/GoogleChrome/puppeteer/issues/2377#issuecomment-414147922
            args: ['--enable-features=NetworkService'],
            ignoreHTTPSErrors: true
        } :
        {};

    const currentInfo = await getBrowserInfo();

    if (currentInfo) {
        try {
            const connectOptions = Object.assign(
                {},
                { browserWSEndpoint: currentInfo.browserWSEndpoint },
                ignoreHTTPSErrorsOption,
                options);

            const browser = await puppeteer.connect(connectOptions);

            debug(`Creating new page in existing browser`);
            const page = await browser.newPage();

            await unlock();

            return { browser, page };
        } catch (e) {
            // The process might be dead so we need to launch a new one and delete the current info file
            await deletePid();
        }
    }

    const launchOptions = { executablePath };

    debug(`Launching new browser instance`);

    const browser = await puppeteer.launch(Object.assign(
        {},
        launchOptions,
        options
    ));

    debug(`Creating new page`);

    /**
     * When the browser starts there's usually a blank page,
     * instead of creating a new one to navigate, it is reused.
     * If none is available, then a new one is created.
     */
    const pages = await browser.pages();

    const page = pages.length > 0 ?
        await pages[0] :
        await browser.newPage();

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
    await lock();

    try {
        const pages = await browser.pages();


        if (pages.length === 1) {
            /**
             * TODO:
             * Guess what happens with headless, does the browser need to be closed?
             * What about macOS?
             */
            await deletePid();
        }

        debug(`Closing page`);
        debug(`Remaining pages: ${pages.length - 1}`);

        await page.close();
    } catch (e) {
        debug(`Error closig page`);
        debug(e);
    } finally {

        await unlock();
    }
};
