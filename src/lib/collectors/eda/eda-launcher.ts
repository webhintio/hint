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

import { ChildProcess, spawn, exec } from 'child_process'; //eslint-disable-line no-unused-vars
import * as fs from 'fs';
import * as path from 'path';

import { delay } from '../../utils/misc';
import { Launcher } from '../shared/launcher';
import { LauncherOptions } from '../../types'; //eslint-disable-line no-unused-vars

export class EDALauncher extends Launcher {
    constructor(options: LauncherOptions) {
        super(options);
    }

    protected async launchBrowser(url): Promise<ChildProcess> {
        const outFile = fs.openSync(path.join(process.cwd(), 'edge-out.log'), 'a');
        const errFile = fs.openSync(path.join(process.cwd(), 'edge-err.log'), 'a');
        const child = spawn('C:\\Program Files\\nodejs\\node.exe', ['node_modules\\edge-diagnostics-adapter\\out\\src\\edgeAdapter.js', '--servetools', '--diagnostics'], {
            detached: true,
            stdio: ['ignore', outFile, errFile]
        });

        child.unref();

        await delay(3000);

        const outFile2 = fs.openSync(path.join(process.cwd(), 'edge-out.log'), 'a');
        const errFile2 = fs.openSync(path.join(process.cwd(), 'edge-err.log'), 'a');

        const child2 = spawn(`start microsoft-edge:${url === 'about:blank' ? '' : url}`, [], {
            detached: true,
            shell: true,
            stdio: ['ignore', outFile2, errFile2]
        });

        child2.unref();

        return child2;
    }
}
