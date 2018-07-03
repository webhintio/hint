import * as path from 'path';
import * as webpack from 'webpack'; // This is used just to have types.

import { FetchEnd, Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';
import asPathString from 'hint/dist/src/lib/utils/network/as-path-string';
import loadPackage from 'hint/dist/src/lib/utils/packages/load-package';

import { WebpackConfigParse, WebpackConfigInvalidConfiguration } from './types';

export default class WebpackConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;
    private newKeyword;

    public constructor(engine: Engine) {
        super(engine, 'webpack-config');

        engine.on('fetch::end::script', this.parseWebpack.bind(this));
        engine.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.engine.emitAsync(`parse::${this.name}::error::not-found`, {});
        }
    }

    private getLocallyInstalledWebpack() {
        try {
            const packageJSON = loadPackage(path.join(process.cwd(), 'node_modules', 'webpack'));

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

        try {
            const config: webpack.Configuration = await import(asPathString(getAsUri(resource)));

            const version = this.getLocallyInstalledWebpack();

            if (!version) {
                await this.engine.emitAsync(`parse::${this.name}::error::not-install`, {});

                return;
            }

            const event: WebpackConfigParse = {
                config,
                resource,
                version
            };

            await this.engine.emitAsync(`parse::${this.name}::end`, event);
        } catch (err) {
            const errorEvent: WebpackConfigInvalidConfiguration = {
                error: err,
                resource
            };

            await this.engine.emitAsync(`parse::${this.name}::error::configuration`, errorEvent);
        }
    }
}
