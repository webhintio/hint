import { promisify } from 'util';
import { unlink } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

import * as locker from 'lockfile';
import * as puppeteer from 'puppeteer-core';

import { debug as d, fs } from '@hint/utils';
import { LaunchOptions } from 'puppeteer-core';

const debug: debug.IDebugger = d(__filename);
const deleteFile = promisify(unlink);
const lockFile = promisify(locker.lock) as (path: string, options: locker.Options) => Promise<void>;
const unlockFile = promisify(locker.unlock);
const lockName = 'puppeteer-connector.lock';
let isLocked = false;

const { readFileAsync, writeFileAsync } = fs;

const infoFile = 'browser.info';
const TIMEOUT = 30000;

export type LifecycleLaunchOptions = LaunchOptions & {
    detached: boolean;
};

type BrowserInfo = {
    browserWSEndpoint: string;
};

const lock = async () => {
    try {
        const start = Date.now();

        debug(`Trying to acquire lock`);
        await lockFile(lockName, {
            pollPeriod: 500,
            retries: 30,
            retryWait: 1000,
            stale: 60000,
            wait: 50000
        });
        isLocked = true;
        debug(`Lock acquired after ${(Date.now() - start) / 1000}`);
    } catch (e) /* istanbul ignore next */ {
        debug(`Error while locking`);
        debug(e);

        throw e;
    }
};

const unlock = async () => {
    /* istanbul ignore else */
    if (isLocked) {
        const start = Date.now();

        debug(`Trying to unlock`);
        await unlockFile(lockName);
        debug(`Unlock successful after ${(Date.now() - start) / 1000}`);
    } else {
        debug(`No need to unlock`);
    }
};

/** If a browser is already running, it returns its pid. Otherwise return value is -1.  */
const getBrowserInfo = async (): Promise<BrowserInfo | null> => {
    let result = { browserWSEndpoint: '' };

    try {
        result = JSON.parse((await readFileAsync(infoFile)).trim());
    } catch (e) /* istanbul ignore next */ {
        debug(`Error reading ${infoFile}`);
        debug(e);

        return null;
    }

    return result;
};

/** Stores the `BrowserInfo` into a file. */
/* istanbul ignore next */
const writeBrowserInfo = async (browser: puppeteer.Browser) => {
    const browserWSEndpoint = browser.wsEndpoint();
    const browserInfo = { browserWSEndpoint };

    await writeFileAsync(infoFile, JSON.stringify(browserInfo, null, 4));
};

/** Deletes the file containing the `BrowserInfo`. */
/* istanbul ignore next */
const deleteBrowserInfo = async () => {
    try {
        await deleteFile(infoFile);
    } catch (e) {
        debug(`Error trying to delete ${infoFile}`);
        debug(e);
    }
};

/**
 * Connects to an existing browser and creates a new page that will disable the cache and
 * use a new incognito context. This is not needed in regular mode as `puppeteer` creates
 * a new temporary profile each time.
 *
 * This should only be used when running in `detached` mode.
 */
const connectToBrowser = async (currentInfo: BrowserInfo, options: LifecycleLaunchOptions) => {
    const connectOptions = { ...currentInfo, ...options };

    const browser = await puppeteer.connect(connectOptions);

    debug(`Creating new page in existing browser`);

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    page.setCacheEnabled(false);
    page.setDefaultTimeout(options.timeout || TIMEOUT);

    return { browser, page };
};

/** Spawns a new detached process that will start a browser using puppeteer. */
/* istanbul ignore next */
const startDetached = (options: LifecycleLaunchOptions): Promise<puppeteer.Browser> => {
    return new Promise((resolve) => {
        const launcherProcess = spawn(
            process.execPath,
            [join(__dirname, 'launcher.js')],
            {
                detached: true,
                stdio: [0, 1, 2, 'ipc']
            });

        launcherProcess.on('message', async (browserInfo: BrowserInfo) => {
            const finalOptions = { ...browserInfo, ...options };
            const browser = await puppeteer.connect(finalOptions);

            launcherProcess.unref();
            launcherProcess.disconnect();

            resolve(browser);
        });

        launcherProcess.send(options);
    });
};

/* istanbul ignore next */
const startBrowser = async (options: LifecycleLaunchOptions) => {
    debug(`Launching new browser instance`);

    let browser;

    if (options.detached) {
        debug(`Starting browser in detached mode with options:
${JSON.stringify(options, null, 2)}
`);
        try {
            browser = await startDetached(options);
        } catch (e) {
            debug(e);

            throw e;
        }
    } else {
        debug(`Starting browser in regular mode with options:
${JSON.stringify(options, null, 2)}
`);
        browser = await puppeteer.launch(options);
    }

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

    page.setDefaultTimeout(options.timeout || TIMEOUT);

    return { browser, page };
};

// TODO: Comments about the status
export const launch = async (options: LifecycleLaunchOptions) => {
    await lock();

    /**
     * Only try to connect to an existing browser when in detached mode,
     * otherwise the browser will be closed when one of the puppeteer
     * instances finishes.
     */
    /* istanbul ignore else */
    if (options.detached) {

        const currentInfo = await getBrowserInfo();

        /* istanbul ignore else */
        if (currentInfo) {
            try {
                const connection = await connectToBrowser(currentInfo, options);

                await unlock();

                return connection;
            } catch (e) /* istanbul ignore next */ {
                // `currentInfo` contains outdated data: delete information and start fresh
                await deleteBrowserInfo();
            }
        }
    }

    const connection = await startBrowser(options);
    const { browser } = connection;

    try {
        await writeBrowserInfo(browser);

        debug('Browser launched correctly');

        await unlock();

        return connection;
    } catch (e) {
        debug('Error launching browser');
        debug(e);

        await unlock();

        throw e;
    }
};

export const close = async (browser: puppeteer.Browser, page: puppeteer.Page) => {
    debug(`Closing`);

    if (!browser) {
        debug(`No browsing instance to close`);

        return;
    }

    await lock();

    try {
        const pages = await browser.pages();

        debug(`Closing page`);
        debug(`Remaining pages: ${pages.length - 1}`);

        /* istanbul ignore if */
        if (pages.length === 1) {
            /**
             * We have to manually close the browser because on macOS non headless
             * the process will still live after closing the last tab and we
             * want to properly close. Otherwise tests might not end and timeout.
             */
            await deleteBrowserInfo();
            await browser.close();
        } else {
            await page.close();
        }
    } catch (e) /* istanbul ignore next */ {
        debug(`Error closing page`);
        debug(e);
    } finally {
        await unlock();
    }
};
