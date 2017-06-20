/**
 * @fileoverview Simple HTTP server used in sonar's tests to mimick certain scenarios.
 */

import * as http from 'http';

import * as _ from 'lodash';
import * as express from 'express';
import * as onHeaders from 'on-headers';

type ServerConfiguration = string | object; //eslint-disable-line

const startPort = 3000;
const maxPort = 65535;

/** A testing server for Sonar rules */
class Server {
    private _app: express;
    private _server: http.Server;
    private _port: number = startPort;

    constructor() {
        this._app = express();
        this._app.disable('x-powered-by');
        this._app.use((req, res, next) => {
            res.setHeader('Cache-Control', 'no-cache');
            next();
        });
    }

    /** Because we don't know the port until we start the server, we need to update
     * the references to http://localhost in the HTML to http://localhost:finalport.
    */
    private updateLocalhost(html: string): string {
        return html.replace(/http:\/\/localhost\//g, `http://localhost:${this._port}/`);
    }

    private handleHeaders = (res, headers) => {
        onHeaders(res, () => {
            Object.entries(headers).forEach(([header, value]) => {
                if (value !== null) {
                    res.setHeader(header, value);
                } else {
                    res.removeHeader(header);
                }
            });
        });
    };

    /** Applies the configuration for routes to the server. */
    configure(configuration: ServerConfiguration) {
        let customFavicon = false;

        if (typeof configuration === 'string') {
            this._app.get('/', (req, res) => {
                res.send(configuration);
            });

            return;
        }

        _.forEach(configuration, (value, key) => {
            customFavicon = customFavicon || key === '/favicon.ico';
            let content;

            if (typeof value === 'string') {
                content = this.updateLocalhost(value);
            } else if (value && typeof value.content !== 'undefined') {
                content = typeof value.content === 'string' ? this.updateLocalhost(value.content) : value.content;
            } else {
                content = '';
            }

            this._app.get(key, (req, res) => {

                // Hacky way to make `request` fail, but required
                // for testing cases such as the internet connection
                // being down when a particular request is made.

                if (value === null) {
                    res.redirect(301, 'test://fa.il');

                    return;
                }

                const redirects = [301, 302, 303, 307, 308];

                if (value && redirects.includes(value.status)) {
                    res.redirect(value.status, content);

                    return;
                }

                if (value && value.status) {
                    res.status(value.status);
                }

                if (value && value.headers) {
                    this.handleHeaders(res, value.headers);
                }

                if (content !== 'timeout') { // if `content === 'timeout'`, leaves the server hanging to test the implementation of timeout.
                    res.send(content);
                }
            });
        });

        if (!customFavicon) {
            this._app.get('/favicon.ico', (req, res) => {
                res.status(200);
                res.setHeader('Content-Length', '0');
                res.setHeader('Content-Type', 'image/x-icon');
            });
        }
    }

    /** Starts listening on the given port. */
    start() {
        return new Promise((resolve, reject) => {
            this._server = http.createServer(this._app);

            // TODO: need to find a way to cast `err` to a [System Error](https://nodejs.org/dist/latest-v7.x/docs/api/errors.html#errors_system_errors)
            this._server.on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    this._port++;
                    if (this._port > maxPort) {
                        // We start in the initial port again, some must be available
                        this._port = startPort;
                    }
                    this._server.listen(this._port);
                } else {
                    reject(err);
                }
            });

            this._server.once('listening', resolve);

            this._server.listen(this._port);
        });
    }

    /** Stops the server and frees the port. */
    stop() {
        this._server.close();
    }

    get port() {
        return this._port;
    }
}

/** Returns a testing server */
const createServer = () => {
    const server = new Server();

    return server;
};

export { createServer, Server };
