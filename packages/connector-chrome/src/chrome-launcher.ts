/**
 * @fileoverview Launches the given browser with the right configuration to be used via the Chrome Debugging Protocol
 *
 */
import { promisify } from 'util';

import * as chromeLauncher from 'chrome-launcher';
import * as isCI from 'is-ci';
import * as lockfile from 'lockfile';

import { Launcher } from '@hint/utils-debugging-protocol-common/dist/src/launcher';
import { BrowserInfo, LauncherOptions } from 'hint/dist/src/lib/types';
import * as logger from 'hint/dist/src/lib/utils/logging';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import delay from 'hint/dist/src/lib/utils/misc/delay';
import readFileAsync from 'hint/dist/src/lib/utils/fs/read-file-async';
import writeFileAsync from 'hint/dist/src/lib/utils/fs/write-file-async';

const debug: debug.IDebugger = d(__filename);
const lock = promisify(lockfile.lock);
const unlock = promisify(lockfile.unlock);

export class CDPLauncher extends Launcher {
    /** Indicates if the default profile should be used by Chrome or not */
    private userDataDir: string | boolean;

    public constructor(options: LauncherOptions) {
        super(options);

        // `userDataDir` is a property in `chrome-launcher`: https://github.com/GoogleChrome/chrome-launcher#launch-options
        /* istanbul ignore next */
        this.userDataDir = typeof options.defaultProfile === 'boolean' && options.defaultProfile ? false : '';
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
            /* istanbul ignore next */
            { // eslint-disable-line
                debug(`Error reading ${this.pidFile}`);
                debug(e);
                result = {
                    pid: -1,
                    port: this.port
                };
            }
        }

        /* istanbul ignore if */
        if (Number.isNaN(result.pid)) {
            return {
                pid: -1,
                port: this.port
            };
        }

        try {
            /*
             * We test if the process is still running or is a leftover:
             * https://nodejs.org/api/process.html#process_process_kill_pid_signal
             */
            /*
             * When running hit tests serially (because we mock a dependency),
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
                result = {
                    pid: -1,
                    port: this.port
                };
            }
        }

        return result;
    }

    /** Stores the `pid` of the given `child` into a file. */
    private async writePid(browserInfo: BrowserInfo) {
        /* istanbul ignore next */
        await writeFileAsync(this.pidFile, JSON.stringify({ pid: browserInfo.pid, port: browserInfo.port || this.port }, null, 4));
    }

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
            /* istanbul ignore next */
            { // eslint-disable-line
                logger.error('Error while locking', e);
                throw e;
            }
        }
        // If a browser is already launched using `launcher` then we return its PID.
        const currentInfo = await this.getBrowserInfo();

        if (currentInfo.pid !== -1) {
            await unlock(cdpLock);

            currentInfo.isNew = false;

            return currentInfo;
        }

        try {
            const chromeFlags: Array<string> = [];

            chromeFlags.push('--no-default-browser-check');

            /* istanbul ignore next */
            if (isCI) {
                chromeFlags.push('--headless', '--disable-gpu');
            }

            const chrome: chromeLauncher.LaunchedChrome = await chromeLauncher.launch({
                chromeFlags,
                /* istanbul ignore next */
                logLevel: debug.enabled ? 'verbose' : 'silent',
                startingUrl: url,
                userDataDir: this.userDataDir
            });

            const browserInfo = {
                isNew: true,
                pid: chrome.pid,
                port: chrome.port
            };

            /* istanbul ignore next */
            browserInfo.port = browserInfo.port || this.port;
            this.port = browserInfo.port;
            await this.writePid(browserInfo);

            debug('Browser launched correctly');

            await unlock(cdpLock);

            return browserInfo;
        } catch (e) {
            /* istanbul ignore next */
            { // eslint-disable-line
                debug('Error launching browser');
                debug(e);

                await unlock(cdpLock);

                throw e;
            }
        }
    }
}
