import * as path from 'path';
import * as webpack from 'webpack'; // This is used just to have types.

import { FetchEnd, Parser } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { getAsUri } from 'sonarwhal/dist/src/lib/utils/get-as-uri';
import { getAsPathString } from 'sonarwhal/dist/src/lib/utils/get-as-path-string';
import { getPackage } from 'sonarwhal/dist/src/lib/utils/misc';

import { WebpackConfigParse, WebpackConfigInvalidConfiguration } from './types';

export default class WebpackConfigParser extends Parser {
    private configFound: boolean = false;
    private schema: any;
    private newKeyword;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal, 'webpack-config');

        sonarwhal.on('fetch::end::script', this.parseWebpack.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync(`parse::${this.name}::error::not-found`, {});
        }
    }

    private getLocallyInstalledWebpack() {
        try {
            const packageJSON = getPackage(path.join(process.cwd(), 'node_modules', 'webpack'));

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
            const config: webpack.Configuration = require(getAsPathString(getAsUri(resource)));

            const version = this.getLocallyInstalledWebpack();

            if (!version) {
                await this.sonarwhal.emitAsync(`parse::${this.name}::error::not-install`, {});

                return;
            }

            const event: WebpackConfigParse = {
                config,
                resource,
                version
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::end`, event);
        } catch (err) {
            const errorEvent: WebpackConfigInvalidConfiguration = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync(`parse::${this.name}::error::configuration`, errorEvent);
        }
    }
}
