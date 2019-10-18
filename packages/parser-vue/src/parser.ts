/**
 * @fileoverview webhint parser needed to analyze Vue single file components files.
 */

import { FetchEnd, Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import { VueEvents } from './types';

export * from './types';

export default class VueParser extends Parser<VueEvents> {
    public constructor(engine: Engine<VueEvents>) {
        super(engine, 'vue');

        engine.on('fetch::end::unknown', async ({ resource, code }: FetchEnd) => {
            await engine.emitAsync(`parse::start::vue`, { resource });

            await engine.emitAsync(`parse::end::vue`, {});
        });
    }
}
