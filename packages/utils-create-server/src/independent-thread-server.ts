import { spawn, ChildProcess, SpawnOptions } from 'child_process';

import { IServer, Message, ServerConfiguration } from './types';
import { replacer, reviver } from './buffer-serialization';

export { ServerConfiguration };
export { IServer };

export class IndependentServer implements IServer {
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

    public start() {
        return this.actionWrapper('start');
    }

    public getPort() {
        return this.actionWrapper('port');
    }

    public constructor(isHTTPS: boolean = false) {
        const pathToServer = `${__dirname}/same-thread-server.js`;
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

    public set port(port: number) {
        this._port = port;
    }

    public get port() {
        return this._port;
    }

    public configure(configuration: ServerConfiguration) {
        return this.actionWrapper('configure', configuration);
    }
}
