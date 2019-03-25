import * as path from 'path';
import * as webpack from 'webpack'; // This is used just to have types.

import { FetchEnd, Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { network } from '@hint/utils';

import { WebpackConfigEvents } from './types';

export * from './types';

const { asPathString, getAsUri } = network;

export default class WebpackConfigParser extends Parser<WebpackConfigEvents> {
    private configFound: boolean = false;

    public constructor(engine: Engine<WebpackConfigEvents>) {
        super(engine, 'webpack-config');

        engine.on('fetch::end::script', this.parseWebpack.bind(this));
        engine.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.engine.emitAsync('parse::error::webpack-config::not-found', {
                error: new Error('webpack.config.js was not found'),
                resource: ''
            });
        }
    }

    private async getLocallyInstalledWebpack() {
        try {
            /*
             * HACK: Need to do an import here in order to be capable of mocking
             * when testing the hint.
             */
            const packageJSON = (await import('@hint/utils/dist/src/packages/load-package')).loadPackage(path.join(process.cwd(), 'node_modules', 'webpack'));

            return packageJSON.version;
        } catch (err) {
            return null;
        }
    }

    private async parseWebpack(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;
        const fileName = path.basename(resource);

        /*
         * In webpack documentation, this is the file name they
         * always use: https://webpack.js.org/configuration/
         */
        if (fileName !== 'webpack.config.js') {
            return;
        }

        this.configFound = true;

        await this.engine.emitAsync(`parse::start::webpack-config`, { resource });

        try {
            const config: webpack.Configuration = await import(asPathString(getAsUri(resource)!)); // `getAsUri(resource)` should not be null as the resource has already been fetched.

            const version = await this.getLocallyInstalledWebpack();

            if (!version) {
                await this.engine.emitAsync('parse::error::webpack-config::not-install', {
                    error: new Error('webpack is not installed'),
                    resource
                });

                return;
            }

            await this.engine.emitAsync('parse::end::webpack-config', {
                config,
                resource,
                version
            });
        } catch (err) {
            await this.engine.emitAsync('parse::error::webpack-config::configuration', {
                error: err,
                resource
            });
        }
    }
}
