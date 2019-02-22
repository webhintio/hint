/**
 * @fileoverview Simple HTTP server used in hint's tests to mimick certain scenarios.
 */

import * as http from 'http';
import * as https from 'https';

import { forEach, random } from 'lodash';
import * as express from 'express';

// to work with option 'strict', we can't use import.
const onHeaders = require('on-headers');

import getHeaderValueNormalized from 'hint/dist/src/lib/utils/network/normalized-header-value';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';

import { Message, ServerConfiguration, WebhintMessage } from './types';
import { replacer, reviver } from './buffer-serialization';

/**
 * List of ports in our range that are unsafe for Chrome.
 * See: https://src.chromium.org/viewvc/chrome/trunk/src/net/base/net_util.cc?view=markup
 */
const unsafePorts = [3659, 4045, 6000, 6665, 6666, 6667, 6668, 6669];


/** A testing server for webhint's hints */
export class Server {
    private static usedPorts = new Set(unsafePorts);
    private static maxPort: number = 65535;
    private static minPort: number = 3000;

    private _app: express.Application;
    private _server: https.Server | http.Server = {} as http.Server;

    private _port: number;
    private _isHTTPS: boolean | undefined;

    private static readonly _cert: string =
`-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJAPrIPsJ7DJ0SMA0GCSqGSIb3DQEBBQUAMBkxFzAVBgNV
BAMMDmxvY2FsaG9zdDo4NDQzMB4XDTE3MDcwNzE3MTI0OVoXDTI3MDcwNTE3MTI0
OVowGTEXMBUGA1UEAwwObG9jYWxob3N0Ojg0NDMwggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQDmIlQAv6ZAGrEg3cHP+NpfqQV+LS0WxSczPAcZmDXJea5e
UAt7Gc9gI7ULIHW68TJ8rGVdZKKriPqXmG/vY9+u/UZ1IwcQZWMTPTDL8Ku1/lDj
0zxO3avujEnHGcgp1RdfS0TsigS5rSWmx+dt9a7zbn1oCh2l6e1HeFd0NF15tXZG
shL5CXxAip6hhZWCkZ5XjOm8iF4Bn2vCO00gb41iIoD7+2NaGBZkQa3L1NfuTpVf
pkW30tRi7QiMOVr7W9I1FNPZAXKvi1pH8nlvYflKrG6XN6V8LzOW3xrYLs3HqbAg
NCFNa2s/elcKOAIZFqN5A5aM30Dd2wGj7XBCKjunAgMBAAGjUDBOMB0GA1UdDgQW
BBQeQAc/3f6lP2Y6GqG/7KCuteMQ4zAfBgNVHSMEGDAWgBQeQAc/3f6lP2Y6GqG/
7KCuteMQ4zAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBBQUAA4IBAQBPXdpOHyTn
UxEXTxBoVSebpewYM/4lyXNI+13j64b2t6wC+nHXZ+beZUMGwznYGe1hXZ0fxfS+
NDEuOEuGvpLReAFj2kW6PpTXg++jt/monBzHZA7RoZxYUJPJImpO/ByEtYoMg5fk
e3111eFlHH+osZ9I1kNmJAAvzNHlnTBIk0sxBRz9jW7hkLJkC0s1pREAwr/sKPjy
xMV8++vDR/e5RfJDHmqCmSv7DG5Q1cLBjvb09Kn9mSqAi9iuZvbMx+mxkocEFC31
w4C7/uFcTns/5rYjv+vp+EGv5cupxJjXpd1O/buT/Tt/Ur5maySbu4vDYVgmPuXU
7avEZJTeYgih
-----END CERTIFICATE-----`

    private static readonly _key: string =
`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA5iJUAL+mQBqxIN3Bz/jaX6kFfi0tFsUnMzwHGZg1yXmuXlAL
exnPYCO1CyB1uvEyfKxlXWSiq4j6l5hv72Pfrv1GdSMHEGVjEz0wy/Crtf5Q49M8
Tt2r7oxJxxnIKdUXX0tE7IoEua0lpsfnbfWu8259aAodpentR3hXdDRdebV2RrIS
+Ql8QIqeoYWVgpGeV4zpvIheAZ9rwjtNIG+NYiKA+/tjWhgWZEGty9TX7k6VX6ZF
t9LUYu0IjDla+1vSNRTT2QFyr4taR/J5b2H5SqxulzelfC8zlt8a2C7Nx6mwIDQh
TWtrP3pXCjgCGRajeQOWjN9A3dsBo+1wQio7pwIDAQABAoIBAQCYmKqa1HmoiApr
gJ/DB3/Fbo313H7JWnFjx6ntjsAbmFPGtcznE3YuiX7CogNusgCIKsgL5W73zxxa
6PlQAymPHuJZSaClfpTzbN+uWyeAxeFdL/QNV29p/hvtqWrQUjvtNDu/nMUFWYpd
zK/oecBIKjt9gTenjDWJ7oIOy6ovyKFqECV8fCFlt7yHC6xEb4Ajkwwl/Bg8Upu+
gbNSZzZ7C0Zhktds5m9rAd2qT810SS/oQEep2Du39lCAEf4mj9aUiW7svi3oGZJq
2hyJKKo93E1SBwP3EoFotE/GEu1wkUUNtAEP9RYbihFA08Gcav/poz/FQ4ZvQL5S
hOugJMABAoGBAPhv+HyT/71u8BNGszu5cCa5vuocohofuwqxiw8Jz7qeNNU8tIM0
Mw2YPF6Dn497WurCxy5cSj/6YWCw0OjDavajm9ht/cPG3mXzT94xIxBDXYG5Grsi
9H677puSDuMZq65CC66OaZgjQidddJEuB/9V3h9pLeSvlyOa/gZcaWWBAoGBAO0j
uR5tInP36YSTU767xXI5x69b/IUnAydHj4Zb1zGS56FNpMvKSkmK4dF49Bsuk7Ba
m7LSG8Z1EdOmC1Tau7bIVGPpbdjpAjHCdtP3VZsiamHZeAai/m0/qmoxj5b1onOM
AeeZvVvfVDMA/8AvyjuUbHqrx4kf5VezVNglwEUnAoGAVMzTgqJ57s1JQSsmzsIT
WASa+ApiAozGKXZEwxNURpzt58Na0lYk/wTxxkkjU7SFahCmMFrsNT5fssNn66uY
fSuHbK7Oqd7d1urgXjVjhI+aAUePqkTaM9AuOAf48Oe4RDjjB+gwfu+6CvnJaizO
KgfDU/Fw6thMvKiRANbWWwECgYA4r5tmzIu50P8/M8CHDXerUGiNYJ3Cborwbsi+
Q2Hzdbxs8JR+KoMLhWlpm1Iu1Tl0pJQncNY24HE8eKqoxAivLsANihU6Dqj5oBSr
oqoSBW4MqeFpJLlRADEKZYJ/gYQtvsANztBXD9Gex5RbKpFbIKW1xS5Tdw5ponKb
oJqPbQKBgH72BOEFirB4Zalji9datqhfWv3HvMqLDrEHMWAhD9ahQv1TUkGVxZ/N
xnh64tuptfPC78Ylw+rEsUOyuWSmi1yzAxQRxaNKmAw7xZ8dPqG/6SLm5B0xYA46
IsW9AGST1xe4XVCLy+FIoo1RVpfJyp8h9zSzDASh/F1+5DY1PUJQ
-----END RSA PRIVATE KEY-----`;

    private getNewValidPort(): number {
        let port = random(Server.minPort, Server.maxPort);

        while (Server.usedPorts.has(port)) {
            port = random(Server.minPort, Server.maxPort);
        }

        return port;
    }

    public constructor(isHTTPS?: boolean) {
        this._port = this.getNewValidPort();
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

    private handleHeaders(res: express.Response, headers: any) {
        onHeaders(res, () => {
            Object.entries(headers).forEach(([header, value]) => {
                if (value !== null) {
                    res.setHeader(header, value as string);
                } else {
                    res.removeHeader(header);
                }
            });
        });
    }

    private getContent(value: any): string {
        if (typeof value === 'string') {
            return this.updateLocalhost(value);
        } else if (value && typeof value.content !== 'undefined') {
            return typeof value.content === 'string' ? this.updateLocalhost(value.content) : value.content;
        }

        return '';
    }

    private getNumberOfMatches(req: express.Request, requestConditions: any) {
        const headers = requestConditions.request && requestConditions.request.headers;

        /*
         * Matching is done only based on headers, as for the time
         * beeing there is no need to match based on other things.
         */

        if (!headers) {
            return 0;
        }

        let numberOfMatches = 0;

        for (const [header, value] of Object.entries(headers)) {
            // TODO: handle `string[]` in `req.headers`
            const headerValue = getHeaderValueNormalized(req.headers as any, header);

            if ((headerValue !== normalizeString(value as string)) || (!headerValue && (value === null))) {
                return 0;
            }

            numberOfMatches++;
        }

        return numberOfMatches;
    }

    private getValue(req: express.Request, config: any) {
        let bestNumberOfMatches = 1;
        let bestMatch = null;

        for (const [key, value] of Object.entries(config)) {
            let requestConditions;

            try {
                requestConditions = JSON.parse(key);

                const newNumberOfMatches = this.getNumberOfMatches(req, requestConditions);

                if (newNumberOfMatches >= bestNumberOfMatches) {
                    bestMatch = value;
                    bestNumberOfMatches = newNumberOfMatches;
                }

            } catch (e) {
                // Ignore invalid keys.
            }
        }

        return bestMatch;
    }

    private isConditionalConfig(configuration: any): boolean {
        /*
         * The following is done to quickly determine the type of
         * configuration. Possible options are:
         *
         * 1) Simple config
         *    (server response is always the same)
         *
         *     {
         *          name: ...,
         *          reports: [{ message: ... }],
         *          serverConfig: {
         *              '/': {
         *                  content: ...,
         *                  headers: ...
         *              },
         *              ...
         *          }
         *      }
         *
         *
         * 2) Conditional config
         *    (server response depends on the request)
         *
         *      {
         *          name: ...
         *          reports: [{ message: ... }],
         *          serverConfig: {
         *              [JSON.stringify({
         *                  headers: {
         *                      ...
         *                  }
         *              })]: {
         *                  '/': {
         *                      content: ...,
         *                      headers: ...
         *                  },
         *             },
         *             ...
         *          }
         *      }
         */

        try {
            return typeof JSON.parse(Object.entries(configuration)[0][0]) === 'object';
        } catch (e) {
            // Ignore.
        }

        return false;
    }

    private normalizeConfig(configuration: any) {
        const config: any = {};

        /*
         * This function convers something such as:
         *
         *  {
         *      '{"request":{"headers":{"Accept-Encoding":"gzip"}}}': {
         *          '/': {
         *              content: ...
         *              headers: ...
         *          },
         *          ...
         *      }
         *      '{"request":{"headers":{"Accept-Encoding":"br"}}}': {
         *          '/': {
         *              content: ...
         *              headers: ...
         *          },
         *          ...
         *      }
         *      ...
         *  }
         *
         *  to
         *
         *  {
         *      '/': {
         *          '{"request":{"headers":{"Accept-Encoding":"gzip"}}}': {
         *              content: ...
         *              headers: ...
         *          },
         *          '{"request":{"headers":{"Accept-Encoding":"br"}}}': {
         *              content: ...
         *              headers: ...
         *          },
         *          ...
         *      }
         *      ...
         *  }
         *
         */

        for (const [k, v] of Object.entries(configuration)) {
            for (const [key, value] of Object.entries(v)) {
                config[key] = Object.assign({}, config[key], { [k]: value });
            }
        }

        return config;
    }

    /** Applies the configuration for routes to the server. */
    public configure(configuration: ServerConfiguration) {
        let customFavicon = false;

        if (typeof configuration === 'string') {
            this._app.get('/', (req, res) => {
                res.send(configuration);
            });

            return;
        }

        const conditionalConfig = this.isConditionalConfig(configuration);
        const config = conditionalConfig ? this.normalizeConfig(configuration) : configuration;

        forEach(config, (val, key) => {
            customFavicon = customFavicon || key === '/favicon.ico';

            this._app.get(key, (req, res) => {

                const value: any = conditionalConfig ? this.getValue(req, val) : val;
                const content = this.getContent(value);

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
                res.end();
            });
        }
    }

    /** Starts listening on the given port. */
    public start(): Promise<null> {

        return new Promise((resolve, reject) => {
            let options;

            if (this._isHTTPS) {
                options = {
                    cert: Server._cert,
                    key: Server._key
                };

                this._server = https.createServer(options, this._app);
            } else {
                this._server = http.createServer(this._app);
            }

            // TODO: need to find a way to cast `err` to a [System Error](https://nodejs.org/dist/latest-v7.x/docs/api/errors.html#errors_system_errors)
            this._server.on('error', (err: any) => {
                // Need to use `console.log` because otherwise we don't get the output
                console.log(`Server Error: ${err.code}`);

                if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
                    setImmediate(() => {
                        this._port = this.getNewValidPort();
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

        return Promise.resolve(null);
    }

    public get port() {
        return this._port;
    }
}

/**
 * We assume that if there's something it means it should be https:
 *
 * `node server.js https` == `node server.js something`
 */
const useHttps = !!process.argv[2];
const server = new Server(useHttps);

type Action = (message: WebhintMessage) => Promise<any>;

/** Wrapper to do the filtering of actions based on the type */
const action = (fn: Action) => {
    const type = fn.name;

    return async (message: Message) => {
        if (message.webhint.type !== type) {
            return false;
        }

        const payload = await fn(message.webhint);

        if (process.send) {
            const message = {
                webhint: {
                    payload,
                    type
                }
            } as Message;
            const serializedMessage = JSON.stringify(message, replacer);

            process.send(serializedMessage);
        }

        return true;
    };
};

const start = (message: WebhintMessage) => server.start();

const stop = (message: WebhintMessage) =>
    // TODO: Disconnect and stop process?
    server.stop();
const port = (message: WebhintMessage) => Promise.resolve(server.port);

const configure = (message: WebhintMessage) => {
    const { payload } = message;

    server.configure(payload as ServerConfiguration);

    return Promise.resolve();
};

const serverActions = [
    action(port),
    action(start),
    action(configure),
    action(stop)
];

process.on('message', async (serializedMessage: string) => {
    const message = JSON.parse(serializedMessage, reviver);

    if (!message.webhint) {
        // Message is not for us
        return;
    }

    const dupe = Array.from(serverActions);
    let handled = false;

    while (!handled) {
        const action = dupe.shift();

        if (!action) {
            break;
        }

        handled = await action(message);

        if (handled) {
            break;
        }
    }
});
