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

/* eslint-disable no-process-env, no-empty, no-unused-vars, no-sync */


import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

import * as lockfile from 'lockfile';
import * as which from 'which';
import * as isCI from 'is-ci';

import { debug as d } from '../../utils/debug';

// ------------------------------------------------------------------------------
// Common
// ------------------------------------------------------------------------------

const lock = promisify(lockfile.lock);
const unlock = promisify(lockfile.unlock);
const debug = d(__filename);
const pidFile = path.join(process.cwd(), 'cdp.pid');
let port = 9222;
const retryDelay = 500;

/** Removes all references to the client used by `isDebuggerReady`. */
const cleanup = (client: net.Socket) => {
    client.removeAllListeners();
    client.end();
    client.destroy();
    client.unref();
};

/** Checks if the debugger is ready by trying to connect to port `9222`. */
const isDebuggerReady = (): Promise<{}> => {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(port);

        client.once('error', (err) => {
            cleanup(client);
            reject(err);
        });
        client.once('connect', () => {
            cleanup(client);
            resolve();
        });
    });
};

/** Waits until the debugger is ready to accept commands or if there have been too many retries. */
const waitUntilReady = () => {

    return new Promise((resolve, reject) => {
        let retries = 0;

        (function poll() {
            retries++;
            debug('Wait for browser.');


            isDebuggerReady()
                .then(() => {
                    debug('Browser ready');
                    resolve();
                })
                .catch((err) => {
                    if (retries > 10) {
                        debug(`Browser didn't initialized in the allocated time`);
                        reject(err);

                        return;
                    }

                    setTimeout(() => {
                        poll();
                    }, retryDelay);

                    return;
                });
        }());
    });
};

// ------------------------------------------------------------------------------
// Chrome functionality
// ------------------------------------------------------------------------------

/** Returns the location of chrome.exe for Windows platforms and a given Chrome directory (available: "Chrome", "Chrome SxS"). */
const getChromeExe = (chromeDirName) => {
    debug('Trying to open Chrome on Windows');

    let windowsChromeDirectory;
    const suffix = `\\Google\\${chromeDirName}\\Application\\chrome.exe`;
    const prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];

    for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];

        try {
            windowsChromeDirectory = path.join(prefix, suffix);
            fs.accessSync(windowsChromeDirectory);

            return windowsChromeDirectory;
        } catch (e) { }
    }

    return windowsChromeDirectory;
};

/** Returns the location of chrome for Linux platforms. */
const getChromeBin = (commands) => {
    debug('Trying to open Chrome on Linux');

    let bin, i;

    for (i = 0; i < commands.length; i++) {
        try {
            if (which.sync(commands[i])) {
                bin = commands[i];
                break;
            }
        } catch (e) { }
    }

    return bin;
};

/** Returns the location of chrome for Mac platforms. */
const getChromeDarwin = (defaultPath) => {
    debug('Trying to open Chrome on Mac');

    try {
        const homePath = path.join(process.env.HOME, defaultPath);

        fs.accessSync(homePath);

        return homePath;
    } catch (e) {
        return defaultPath;
    }
};

/** Gets the right path to launch Chrome */
const getChrome = (): string => {
    let bin = '';

    switch (process.platform) {
        case 'darwin': bin = getChromeDarwin('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
            break;
        case 'linux': bin = getChromeBin(['google-chrome', 'google-chrome-stable']);
            break;
        case 'win32': bin = getChromeExe('Chrome');
            break;
        default: break;
    }

    return bin;
};

/** If a browser is already running, it returns its pid. Otherwise return value is -1.  */
const getPid = (): number => {
    let pid = -1;

    try {
        pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
    } catch (e) {
        debug(`Error reading ${pidFile}`);
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
};

/** Stores the `pid` of the given `child` into a file. */
const writePid = (child: ChildProcess) => {
    const pid = child.pid;

    fs.writeFileSync(pidFile, pid, { encoding: 'utf8' });
};

/** Launches chrome with the given url and ready to be used with the Chrome Debugging Protocol.
 *
 * If the browser is a new instance it will return `true`, `false` otherwise.
*/
const launchChrome = async (url: string, options?): Promise<boolean> => {
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
    // If a browser is already launched using `cdp-launcher` then we return its PID.
    const currentPid = getPid();

    if (currentPid !== -1) {
        await unlock(cdpLock);

        return false;
    }

    port = options && options.port || port;

    let chromeFlags = [
        '--remote-debugging-port=9222',
        // Disable built-in Google Translate service
        '--disable-translate',
        // Disable all chrome extensions entirely
        '--disable-extensions',
        // Disable various background network services, including extension updating,
        //   safe browsing service, upgrade detector, translate, UMA
        '--disable-background-networking',
        // Disable fetching safebrowsing lists, likely redundant due to disable-background-networking
        '--safebrowsing-disable-auto-update',
        // Disable syncing to a Google account
        '--disable-sync',
        // Disable reporting to UMA, but allows for collection
        '--metrics-recording-only',
        // Disable installation of default apps on first run
        '--disable-default-apps',
        // Skip first run wizards
        '--no-first-run',
        // Place Chrome profile in a temp location
        `--user-data-dir=${tmpdir()}`,
        // We don't want the message in case chrome isn't the default one
        '--no-default-browser-check',
        url
    ];

    if (isCI) {
        chromeFlags.push('--headless');
    }
    chromeFlags = chromeFlags.concat(options && options.flags || []);

    try {
        const chromePath = getChrome();
        const outFile = fs.openSync(path.join(process.cwd(), 'chrome-out.log'), 'a');
        const errFile = fs.openSync(path.join(process.cwd(), 'chrome-err.log'), 'a');

        debug(`Executing ${chromePath}`);

        const child = spawn(chromePath, chromeFlags, {
            detached: true,
            stdio: ['ignore', outFile, errFile]
        });

        child.unref();

        writePid(child);

        debug('Command executed correctly');
        await waitUntilReady();

        await unlock(cdpLock);

        return true;
    } catch (e) {
        debug('Error executing command');
        debug(e);

        await unlock(cdpLock);

        throw e;
    }
};

export { launchChrome };
