/**
 * @fileoverview Simple HTTP server used in sonarwhal's tests to mimick certain scenarios.
 */
import * as fs from 'fs-extra';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

import * as _ from 'lodash';
import * as express from 'express';
import * as onHeaders from 'on-headers';

export type ServerConfiguration = string | object; //eslint-disable-line

const maxPort = 65535;

/** A testing server for sonarwhal's rules */
export class Server {
    private _app;
    private _server: https.Server | http.Server;
    private _port: number = _.random(3000, 65000);
    private _isHTTPS: boolean;

    public constructor(isHTTPS?: boolean) {
        this._app = express();
        this._app.disable('x-powered-by');
        this._app.use((req, res, next) => {
            res.setHeader('Cache-Control', 'no-cache');
            next();
        });
        this._isHTTPS = isHTTPS;
    }

    /**
     * Because we don't know the port until we start the server, we need to update
     * the references to http://localhost in the HTML to http://localhost:finalport.
     */
    private updateLocalhost(html: string): string {
        return html.replace(/\/\/localhost\//g, `//localhost:${this._port}/`);
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
    public configure(configuration: ServerConfiguration) {
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

                /*
                 * Hacky way to make `request` fail, but required
                 * for testing cases such as the internet connection
                 * being down when a particular request is made.
                 */

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
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.end();
            });
        }
    }

    /** Starts listening on the given port. */
    public start() {
        return new Promise(async (resolve, reject) => {
            let options;

            if (this._isHTTPS) {
                options = {
                    cert: await fs.readFile(path.join(__dirname, 'fixture/server.crt'), 'utf8'),
                    key: await fs.readFile(path.join(__dirname, 'fixture/server.key'), 'utf8')
                };

                this._server = https.createServer(options, this._app);
            } else {
                this._server = http.createServer(this._app);
            }

            // TODO: need to find a way to cast `err` to a [System Error](https://nodejs.org/dist/latest-v7.x/docs/api/errors.html#errors_system_errors)
            this._server.on('error', (err: any) => {
                console.error(err.code);

                if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
                    setImmediate(() => {
                        this._port++;
                        if (this._port > maxPort) {
                            this._port = _.random(3000, 65000);
                        }
                        this._server.close();
                        this._server.listen(this._port);
                    });
                } else {
                    reject(err);
                }
            });

            this._server.once('listening', () => {
                resolve();
            });

            this._server.listen(this._port);
        });
    }

    /** Stops the server and frees the port. */
    public stop() {
        this._server.close();
    }

    public get port() {
        return this._port;
    }
}

/** Returns a testing server */
export const createServer = (isHTTPS?: boolean) => {
    return new Server(isHTTPS);
};
