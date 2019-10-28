import map = require('lodash/map');
import reduce = require('lodash/reduce');

import * as isCI from 'is-ci';

import { IServer, ServerConfiguration } from './types';

import { SameThreadServer } from './same-thread-server';
import { IndependentServer } from './independent-thread-server';

export { ServerConfiguration };
export { IServer };

// Do all magic wit process here and maybe have a wrapper

type ServerOptions = {
    configuration?: ServerConfiguration;
    isHTTPS?: boolean;
    sameThread?: boolean;
}

export class Server {
    /**
     * Updates all references to localhost to use the passed port.
     *
     * This does a deep search in all the object properties.
     */
    public static updateLocalhost(content: any, port: number): any {
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

    private static async createIndependentServer(options: ServerOptions) {
        const server = new IndependentServer(options.isHTTPS);

        await server.start();
        server.port = await server.getPort() as unknown as number;

        if (options && options.configuration) {
            await server.configure(Server.updateLocalhost(options.configuration, server.port));
        }

        return server;
    }

    private static async createSameThreadServer(options: ServerOptions) {
        const server = new SameThreadServer(options.isHTTPS);

        await server.start();

        if (options && options.configuration) {
            server.configure(Server.updateLocalhost(options.configuration, server.getPort()));
        }

        return server;
    }

    public static create(options: ServerOptions = {}): Promise<IServer> {
        const sameThread = typeof options.sameThread !== 'undefined' ?
            options.sameThread :
            isCI;

        if (sameThread) {
            return this.createSameThreadServer(options);
        }

        return this.createIndependentServer(options);

    }
}
