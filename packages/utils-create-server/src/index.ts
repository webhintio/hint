import { spawn, ChildProcess, SpawnOptions } from 'child_process';

import map = require('lodash/map');
import reduce = require('lodash/reduce');

import { Message, ServerConfiguration } from './types';
import { replacer, reviver } from './buffer-serialization';

export { ServerConfiguration };

// Do all magic wit process here and maybe have a wrapper

type ServerOptions = {
    configuration?: ServerConfiguration;
    isHTTPS?: boolean;
}

export class Server {
    private child: ChildProcess;
    private actions: Map<string, Function> = new Map();
    private _port = 0;

    private onMessage(serializedMessage: string) {
        const message = JSON.parse(serializedMessage, reviver) as Message;

        if (!message.webhint) {
            // message is not for us
            return;
        }

        if (this.actions.has(message.webhint.type)) {
            const action = this.actions.get(message.webhint.type);
            const payload = message.webhint.payload || undefined;

            action!(payload);

            this.actions.delete(message.webhint.type);
        }
    }

    private actionWrapper(type: string, payload?: ServerConfiguration) {

        return new Promise((resolve, reject) => {
            /*
             * Because ava sends also messages we scope everything under
             * `webhint` to avoid any possible collusion.
             */
            const message = {
                webhint: {
                    payload,
                    type
                }
            } as Message;

            /**
             * `send()` doesn't have a `replacer` parameter so
             * we need to manually serialize before to make sure
             * `Buffers` are sent correctly.
             */
            const serializedMessage = JSON.stringify(message, replacer);

            this.child.send(serializedMessage, (error) => {

                if (error) {
                    reject(error);
                }
            });

            this.actions.set(type, resolve);
        });
    }

    private start() {
        return this.actionWrapper('start');
    }

    private getPort() {
        return this.actionWrapper('port');
    }

    private constructor(isHTTPS?: boolean) {
        const pathToServer = `${__dirname}/server.js`;
        const serverArgs = isHTTPS ? 'https' : '';
        const opts = {
            cwd: __dirname,
            stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        };

        /**
         * We have to use `spawn` instead of `fork` because
         * nyc on Windows seems to have problems and the
         * server never gets executed.
         */
        this.child = spawn(
            process.execPath,
            [pathToServer, serverArgs],
            opts as SpawnOptions);

        this.child.on('message', this.onMessage.bind(this));

        this.child.on('error', (error) => {
            console.log('Error on child');
            console.log(error);
        });

        this.child.on('disconnect', () => {
            console.log('disconnected');
        });
    }

    public stop() {
        return this.actionWrapper('stop');
    }

    public get port() {
        return this._port;
    }

    public configure(configuration: ServerConfiguration) {
        return this.actionWrapper('configure', configuration);
    }

    /**
     * Updates all references to localhost to use the passed port.
     *
     * This does a deep search in all the object properties.
     */
    public static updateLocalhost(content: any, port: any): any {
        if (typeof content === 'string') {
            return content.replace(/localhost\//g, `localhost:${port}/`);
        }

        const noNeedsUpdate = typeof content === 'number' ||
            Buffer.isBuffer(content) ||
            !content;

        if (noNeedsUpdate) {
            return content;
        }

        if (Array.isArray(content)) {
            const transformed = map(content, (value) => {
                return Server.updateLocalhost(value, port);
            });

            return transformed;
        }


        const transformed = reduce(content, (obj: any, value, key) => {
            obj[key] = Server.updateLocalhost(value, port);

            return obj;
        }, {});

        return transformed;
    }

    public static async create(options?: ServerOptions) {
        const server = new Server(options && options.isHTTPS);

        await server.start();
        server._port = await server.getPort() as unknown as number;

        if (options && options.configuration) {
            await server.configure(Server.updateLocalhost(options.configuration, server._port));
        }

        return server;
    }
}
