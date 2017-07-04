/**
 * @fileoverview Launches the given browser with the right configuration to be used via the Chrome Debugging Protocol
 *
 * Supported browsers: Chrome
 *
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';

import * as lockfile from 'lockfile';
import { promisify } from 'util';

import { BrowserInfo, ILauncher, LauncherOptions } from '../../types';
import { loggerInitiator } from '../../utils/logging';
import { readFileAsync, writeFileAsync } from '../../utils/misc';

const lock = promisify(lockfile.lock);
const unlock = promisify(lockfile.unlock);
const logger = loggerInitiator(__filename);


// ------------------------------------------------------------------------------
// Common
// ------------------------------------------------------------------------------
export abstract class Launcher implements ILauncher {
    private pidFile: string = path.join(process.cwd(), 'cdp.pid');
    protected port: number = 9222;
    private retryDelay: number = 500;
    protected options: LauncherOptions = null;

    constructor(options: LauncherOptions) {
        this.options = options;
    }

    /** If a browser is already running, it returns its pid. Otherwise return value is -1.  */
    private async getBrowserInfo(): Promise<BrowserInfo> {
        let result = {
            pid: -1,
            port: this.port
        };

        try {
            result = JSON.parse(await readFileAsync(this.pidFile));
        } catch (e) {
            logger.debug(`Error reading ${this.pidFile}`);
            logger.debug(e);
            result = {
                pid: -1,
                port: this.port
            };
        }

        if (Number.isNaN(result.pid)) {
            return {
                pid: -1,
                port: this.port
            };
        }

        try {
            // We test if the process is still running or is a leftover:
            // https://nodejs.org/api/process.html#process_process_kill_pid_signal

            process.kill(result.pid, 0);
        } catch (e) {
            logger.debug(`Process with ${result.pid} doesn't seem to be running`);
            result = {
                pid: -1,
                port: this.port
            };
        }

        return result;
    }

    /** Stores the `pid` of the given `child` into a file. */
    private async writePid(browserInfo: BrowserInfo) {
        await writeFileAsync(this.pidFile, JSON.stringify({ pid: browserInfo.pid, port: browserInfo.port || this.port }, null, 4));
    }

    protected abstract async launchBrowser(url: string): Promise<BrowserInfo>;

    /** Launches chrome with the given url and ready to be used with the Chrome Debugging Protocol.
     *
     * If the browser is a new instance it will return `true`, `false` otherwise.
    */
    public async launch(url: string): Promise<BrowserInfo> {
        const cdpLock = 'cdp.lock';

        try {
            await lock(cdpLock, {
                pollPeriod: 500,
                retries: 20,
                retryWait: 1000,
                stale: 50000,
                wait: 50000
            });
        } catch (e) {
            logger.error('Error while locking', e);
            throw e;
        }
        // If a browser is already launched using `launcher` then we return its PID.
        const currentInfo = await this.getBrowserInfo();

        if (currentInfo.pid !== -1) {
            await unlock(cdpLock);

            currentInfo.isNew = false;
            return currentInfo;
        }

        try {
            const browserInfo = await this.launchBrowser(url);

            browserInfo.isNew = true;
            browserInfo.port = browserInfo.port || this.port;
            this.port = browserInfo.port;
            await this.writePid(browserInfo);

            logger.debug('Browser launched correctly');

            await unlock(cdpLock);

            return browserInfo;
        } catch (e) {
            logger.debug('Error launching browser');
            logger.debug(e);

            await unlock(cdpLock);

            throw e;
        }
    }
}
