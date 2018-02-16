/**
 * @fileoverview Launches the given browser with the right configuration to be used via the Chrome Debugging Protocol
 *
 * Supported browsers: Microsoft Edge 15
 *
 */

/* eslint-disable no-sync */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { delay } from 'sonarwhal/dist/src/lib/utils/misc';
import { Launcher } from 'sonarwhal/dist/src/lib/connectors/debugging-protocol-common/launcher';
import * as logging from 'sonarwhal/dist/src/lib/utils/logging';
import { BrowserInfo, LauncherOptions } from 'sonarwhal/dist/src/lib/types';
import * as nodeWindows from 'node-windows';

const diagnosticsPath = require.resolve('edge-diagnostics-adapter');
const elevate = promisify(nodeWindows.elevate);

const debug = d(__filename);

export class EdgeLauncher extends Launcher {
    private retryDelay: number = 500;

    public constructor(options: LauncherOptions) {
        super(options);
    }

    /** Removes all references to the client used by `isDebuggerReady`. */
    private cleanup(client: net.Socket) {
        client.removeAllListeners();
        client.end();
        client.destroy();
        client.unref();
    }

    /** Checks if the debugger is ready by trying to connect to the default port. */
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
    private waitUntilReady() {
        return new Promise((resolve, reject) => {
            let retries = 0;

            const poll = () => {
                retries++;
                debug('Wait for browser.');

                this.isDebuggerReady()
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
                        }, this.retryDelay);

                        return;
                    });
            };

            poll();
        });
    }

    /**
     * Test if we are running sonarwhal in a Windows 10 machine
     */
    private isWin10() {
        return {
            isWin: (/^win/).test(process.platform),
            version: parseInt(os.release().split('.')[0], 10)
        };
    }

    private checkIfRunning(procs: Array<string>): Promise<Array<boolean>> {
        return new Promise((resolve, reject) => {
            const cmd = spawn('cmd');
            let out = [];

            cmd.stdout.on('data', (data) => {
                out = out.concat(data);
            });

            cmd.on('exit', () => {
                const data = out.toString();

                const result = procs.map((proc) => {
                    return data.includes(proc);
                });

                resolve(result);
            });

            cmd.stderr.on('data', () => {
                reject('Error getting processes');
            });

            cmd.on('error', (err) => {
                reject(err);
            });

            cmd.stdin.write('wmic process get ProcessId,CommandLine \n');
            cmd.stdin.end();
        });
    }

    public async launch(url): Promise<BrowserInfo> {
        const osInfo = this.isWin10();

        if (!osInfo.isWin || osInfo.version < 10) {
            const message = 'Edge diagnostics adapter needs windows 10';

            logging.error(message);
            throw new Error(message);
        }

        const [isEdgeAdapterRunning, isEdgeRunning] = await this.checkIfRunning(['edgeAdapter.js', 'MicrosoftEdge.exe']);

        if (!isEdgeAdapterRunning) {
            await elevate(`"${process.execPath}" ${diagnosticsPath} --servetools --diagnostics --port=${this.port}`, {});
        }

        await this.waitUntilReady();

        if (!isEdgeRunning) {
            const outFile2 = fs.openSync(path.join(process.cwd(), 'edge-out.log'), 'a');
            const errFile2 = fs.openSync(path.join(process.cwd(), 'edge-err.log'), 'a');

            const child2 = spawn(`start microsoft-edge:${url === 'about:blank' ? '' : url}`, [], {
                detached: true,
                shell: true,
                stdio: ['ignore', outFile2, errFile2]
            });

            child2.unref();

            await delay(3000);

            return {
                isNew: true,
                pid: -1,
                port: this.port
            };
        }

        return {
            isNew: false,
            pid: -1,
            port: this.port
        };
    }
}
