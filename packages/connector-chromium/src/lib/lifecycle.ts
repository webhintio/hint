import { promisify } from 'util';
import { unlink } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

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

const infoFile = 'chromium.info';
const executablePath = chromiumFinder.getInstallationPath();

debug(`Chromium executable: ${executablePath}`);

type BrowserInfo = {
    browserWSEndpoint: string;
}

const lock = async () => {
    try {
        debug(`Trying to acquire lock`);
        await lockFile(lockName, {
            retries: 30,
            retryWait: 1000,
            stale: 60000
        });
        isLocked = true;
        debug(`Lock acquired`);
    } catch (e) /* istanbul ignore next */ {
        debug(`Error while locking`, e);

        throw e;
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
const writeBrowserInfo = async (browserInfo: BrowserInfo) => {
    /* istanbul ignore next */
    await writeFileAsync(infoFile, JSON.stringify(browserInfo, null, 4));
};

/** Deletes the file containing the `BrowserInfo`. */
const deleteBrowserInfo = async () => {
    try {
        await deleteFile(infoFile);
    } catch (e) {
        debug(`Error trying to delete ${infoFile}`);
        debug(e);
    }
};

/** Spawns a new detached process that will start a browser using puppeteer. */
const startDetached = (options: any): Promise<puppeteer.Browser> => {
    return new Promise((resolve) => {
        const launcherProcess = spawn(
            process.execPath,
            [join(__dirname, 'launcher.js')],
            {
                detached: true,
                stdio: [0, 1, 2, 'ipc']
            });

        launcherProcess.on('message', async (browserInfo) => {
            const { browserWSEndpoint } = browserInfo;
            const browser = await puppeteer.connect({ browserWSEndpoint });

            launcherProcess.unref();
            launcherProcess.disconnect();

            resolve(browser);
        });

        launcherProcess.send(options);
    });
};

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
            await deleteBrowserInfo();
        }
    }

    const launchOptions = { executablePath };

    debug(`Launching new browser instance`);

    const finalOptions = Object.assign(
        {},
        launchOptions,
        options
    );

    let browser;

    if (options.detached) {
        debug(`Starting browser in detached mode`);
        try {
            browser = await startDetached(finalOptions);
        } catch (e) {
            debug(e);

            throw e;
        }
    } else {
        debug(`Starting browser in regular mode`);
        browser = await puppeteer.launch(finalOptions);
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

    const browserWSEndpoint = browser.wsEndpoint();

    try {
        const browserInfo = { browserWSEndpoint };

        await writeBrowserInfo(browserInfo);

        debug('Browser launched correctly');

        await unlock();

        return { browser, page };
    } catch (e) /* istanbul ignore next */ {
        debug('Error launching browser');
        debug(e);

        await unlock();

        throw e;
    }
};

export const close = async (browser: puppeteer.Browser, page: puppeteer.Page) => {
    if (!browser) {
        return;
    }

    await lock();

    try {
        const pages = await browser.pages();

        if (pages.length === 1) {
            await deleteBrowserInfo();
        }

        debug(`Closing page`);
        debug(`Remaining pages: ${pages.length - 1}`);

        await page.close();
    } catch (e) {
        debug(`Error closing page`);
        debug(e);
    } finally {

        await unlock();
    }
};
