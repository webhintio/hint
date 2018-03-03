import { TypeScriptConfig, TypeScriptConfigInvalid, TypeScriptConfigParse } from './types';
import { FetchEnd, Parser } from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';

export default class TypeScriptConfigParser extends Parser {
    private configFound: boolean = false;

    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal);

        sonarwhal.on('fetch::end::*', this.parseTypeScript.bind(this));
        sonarwhal.on('scan::end', this.parseEnd.bind(this));
    }

    private async parseEnd() {
        if (!this.configFound) {
            await this.sonarwhal.emitAsync('notfound::typescript-config', {});
        }
    }

    private async parseTypeScript(fetchEnd: FetchEnd) {
        const resource = fetchEnd.resource;

        /**
         * Match examples:
         * tsconfig.json
         * tsconfig.improved.json
         * tsconfig.whatever.json
         *
         * Not Match examples:
         * tsconfigimproved.json
         * anythingelse.json
         */
        if (!resource.match(/tsconfig\.([^.]*\.)?json/gi)) {
            return;
        }

        this.configFound = true;
        let config: TypeScriptConfig;

        try {
            config = JSON.parse(fetchEnd.response.body.content);

            const event: TypeScriptConfigParse = {
                config,
                resource
            };

            // Emit the configuration even if it isn't valid.
            await this.sonarwhal.emitAsync('parse::typescript-config', event);
        } catch (err) {
            const errorEvent: TypeScriptConfigInvalid = {
                error: err,
                resource
            };

            await this.sonarwhal.emitAsync('invalid-json::typescript-config', errorEvent);
        }
    }
}
