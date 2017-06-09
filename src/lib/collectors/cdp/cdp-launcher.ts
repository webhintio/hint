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

import { ChildProcess, spawn } from 'child_process'; //eslint-disable-line no-unused-vars
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

import * as which from 'which';

import { debug as d } from '../../utils/debug';
import { Launcher } from '../shared/launcher';
import { LauncherOptions } from '../../types'; //eslint-disable-line no-unused-vars

const debug = d(__filename);

export class CDPLauncher extends Launcher {
    constructor(options: LauncherOptions) {
        super(options);
    }
    /** Returns the location of chrome.exe for Windows platforms and a given Chrome directory (available: "Chrome", "Chrome SxS"). */
    private getChromeExe(chromeDirName): string {
        debug('Trying to open Chrome on Windows');

        let windowsChromeDirectory;
        const suffix = `\\Google\\${chromeDirName}\\Application\\chrome.exe`;
        const prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']]; //eslint-disable-line no-process-env

        for (let i = 0; i < prefixes.length; i++) {
            const prefix = prefixes[i];

            try {
                windowsChromeDirectory = path.join(prefix, suffix);
                fs.accessSync(windowsChromeDirectory);

                return windowsChromeDirectory;
            } catch (e) { } //eslint-disable-line no-empty
        }

        return windowsChromeDirectory;
    }

    /** Returns the location of chrome for Linux platforms. */
    private getChromeBin(commands): string {
        debug('Trying to open Chrome on Linux');

        let bin: string;

        for (let i = 0; i < commands.length; i++) {
            try {
                if (which.sync(commands[i])) {
                    bin = commands[i];
                    break;
                }
            } catch (e) { } //eslint-disable-line no-empty
        }

        return bin;
    }

    /** Returns the location of chrome for Mac platforms. */
    private getChromeDarwin(defaultPath): string {
        debug('Trying to open Chrome on Mac');

        try {
            const homePath = path.join(process.env.HOME, defaultPath); //eslint-disable-line no-process-env

            fs.accessSync(homePath);

            return homePath;
        } catch (e) {
            return defaultPath;
        }
    }

    /** Gets the right path to launch Chrome */
    private getChrome(): string {
        let bin: string = '';

        switch (process.platform) {
            case 'darwin': bin = this.getChromeDarwin('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
                break;
            case 'linux': bin = this.getChromeBin(['google-chrome', 'google-chrome-stable']);
                break;
            case 'win32': bin = this.getChromeExe('Chrome');
                break;
            default: break;
        }

        return bin;
    }

    protected launchBrowser(url): ChildProcess {
        this.port = this.options && this.options.port || this.port;

        const chromeFlags = [
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
        ].concat(this.options && this.options.flags || []);

        const chromePath = this.getChrome();
        const outFile = fs.openSync(path.join(process.cwd(), 'chrome-out.log'), 'a');
        const errFile = fs.openSync(path.join(process.cwd(), 'chrome-err.log'), 'a');
        const child = spawn(chromePath, chromeFlags, {
            detached: true,
            stdio: ['ignore', outFile, errFile]
        });

        child.unref();

        return child;
    }
}
