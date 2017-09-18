/**
 * @fileoverview Launches the given browser with the right configuration to be used via the Chrome Debugging Protocol
 *
 */

/* eslint-disable no-sync */

import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';

import { BrowserInfo, ILauncher, LauncherOptions } from '../../types';

// ------------------------------------------------------------------------------
// Common
// ------------------------------------------------------------------------------

export abstract class Launcher implements ILauncher {
    protected pidFile: string = path.join(process.cwd(), 'cdp.pid');
    protected port: number = 9222;
    protected options: LauncherOptions = null;

    constructor(options: LauncherOptions) {
        this.options = options;
    }

    /**
     * Launches browser with the given url and ready to be used with the Chrome Debugging Protocol.
    */
    public abstract async launch(url: string): Promise<BrowserInfo>;
}
