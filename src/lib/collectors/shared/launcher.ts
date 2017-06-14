/**
 * @fileoverview Launches the given browser with the right configuration to be used via the Chrome Debugging Protocol
 *
 * Supported browsers: Chrome
 *
 * This is a mix between:
 * * [lighthouse chrome launcher](https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-cli/chrome-launcher.ts) (Apache 2.0 License)
 * * [karma chrome launcher](https://github.com/karma-runner/karma-chrome-launcher/blob/master/index.js) (MIT License)
 * * And custom code
 *
 */

/* eslint-disable no-sync */

import { ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';

import * as lockfile from 'lockfile';
import * as pify from 'pify';

import { ILauncher, LauncherOptions } from '../../types';
import { debug as d } from '../../utils/debug';

const lock = pify(lockfile.lock);
const unlock = pify(lockfile.unlock);
const debug = d(__filename);

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

    /** Removes all references to the client used by `isDebuggerReady`. */
    private cleanup(client: net.Socket): void {
        client.removeAllListeners();
        client.end();
        client.destroy();
        client.unref();
    }

    /** Checks if the debugger is ready by trying to connect to port `9222`. */
    private isDebuggerReady(): Promise<{}> {
        return new Promise((resolve, reject) => {
            const client = net.createConnection(this.port);

            client.once('error', (err) => {
                this.cleanup(client);
                reject(err);
            });
            client.once('connect', () => {
                this.cleanup(client);
                resolve();
            });
        });
    }

    /** Waits until the debugger is ready to accept commands or if there have been too many retries. */
    private waitUntilReady(): Promise<{}> {
        return new Promise((resolve, reject) => {
            let retries = 0;

            const poll = async () => {
                retries++;
                debug('Wait for browser.');

                try {
                    this.isDebuggerReady();
                    debug('Browser ready');
                    resolve();
                } catch (err) {
                    if (retries > 10) {
                        debug(`Browser didn't initialized in the allocated time`);
                        reject(err);

                        return;
                    }

                    setTimeout(() => {
                        poll();
                    }, this.retryDelay);

                    return;
                }
            };

            poll();
        });
    }

    /** If a browser is already running, it returns its pid. Otherwise return value is -1.  */
    private getPid(): number {
        let pid = -1;

        try {
            pid = parseInt(fs.readFileSync(this.pidFile, 'utf8'));
        } catch (e) {
            debug(`Error reading ${this.pidFile}`);
            debug(e);
            pid = -1;
        }

        if (Number.isNaN(pid)) {
            return -1;
        }

        try {
            // We test if the process is still running or is a leftover:
            // https://nodejs.org/api/process.html#process_process_kill_pid_signal

            process.kill(pid, 0);
        } catch (e) {
            debug(`Process with ${pid} doesn't seem to be running`);
            pid = -1;
        }

        return pid;
    }

    /** Stores the `pid` of the given `child` into a file. */
    private writePid(child: ChildProcess): void {
        const pid = child.pid;

        fs.writeFileSync(this.pidFile, pid, 'utf8');
    }

    protected abstract launchBrowser(url: string): ChildProcess;

    /** Launches chrome with the given url and ready to be used with the Chrome Debugging Protocol.
     *
     * If the browser is a new instance it will return `true`, `false` otherwise.
    */
    public async launch(url: string): Promise<boolean> {
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
            console.error(e);
            throw e;
        }
        // If a browser is already launched using `launcher` then we return its PID.
        const currentPid = this.getPid();

        if (currentPid !== -1) {
            await unlock(cdpLock);

            return false;
        }

        try {
            const child = this.launchBrowser(url);

            this.writePid(child);

            debug('Command executed correctly');
            await this.waitUntilReady();

            await unlock(cdpLock);

            return true;
        } catch (e) {
            debug('Error executing command');
            debug(e);

            await unlock(cdpLock);

            throw e;
        }
    }
}
