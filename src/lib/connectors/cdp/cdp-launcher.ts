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

import { spawn } from 'child_process'; // eslint-disable-line no-unused-vars

import * as chromeLauncher from 'chrome-launcher';
import * as isCI from 'is-ci';

import { Launcher } from '../shared/launcher';
import { BrowserInfo, LauncherOptions } from '../../types'; // eslint-disable-line no-unused-vars


export class CDPLauncher extends Launcher {
    public constructor(options: LauncherOptions) {
        super(options);
    }

    protected async launchBrowser(url): Promise<BrowserInfo> {
        const chromeFlags: Array<string> = [];

        chromeFlags.push('--no-default-browser-check');
        if (isCI) {
            chromeFlags.push('--headless', '--disable-gpu');
        }

        const chrome: chromeLauncher.LaunchedChrome = await chromeLauncher.launch({
            chromeFlags,
            startingUrl: url
        });

        const { pid, port } = chrome;

        return {
            pid,
            port
        };
    }
}
