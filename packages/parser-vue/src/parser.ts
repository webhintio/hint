/**
 * @fileoverview webhint parser needed to analyze Vue single file components files.
 */

import { debug as d } from '@hint/utils-debug';
import { Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { HTMLEvents } from '@hint/parser-html';
import { ScriptEvents } from '@hint/parser-javascript';
// import { HTMLDocument } from '@hint/utils-dom';

const debug = d(__filename);

export default class VueParser extends Parser<HTMLEvents> {
    public constructor(engine: Engine<HTMLEvents & ScriptEvents>) {
        super(engine, 'vue');

        engine.on('fetch::end::unknown', async ({ resource }) => {
            if (!resource.endsWith('.vue')) {
                return;
            }

            debug(`Parsing Vue file: ${resource}`);

            await engine.emitAsync(`parse::start::html`, { resource });

            // const document = new HTMLDocument({}, resource);

            // await engine.emitAsync(`parse::end::html`, { document, html: '', resource });
        });
    }
}
