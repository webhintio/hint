/**
 * @fileoverview Launches the given browser with the right configuration to be used via the Chrome Debugging Protocol
 *
 */

import * as path from 'path';

import { BrowserInfo, ILauncher, LauncherOptions } from 'hint';

/*
 * ------------------------------------------------------------------------------
 * Common
 * ------------------------------------------------------------------------------
 */

export abstract class Launcher implements ILauncher {
    protected pidFile: string = path.join(process.cwd(), 'cdp.pid');
    protected port?: number = 9222;
    protected _options: LauncherOptions;

    public get options(){
        return this._options;
    }

    public constructor(options: LauncherOptions) {
        this._options = options;
    }

    /**
     * Launches browser with the given url and ready to be used with the Chrome Debugging Protocol.
     */
    public abstract async launch(url: string): Promise<BrowserInfo>;
}
