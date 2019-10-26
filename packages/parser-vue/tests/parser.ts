import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { FetchEnd } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';

import * as VueParser from '../src/parser';
import { VueEvents } from '../src/types';

test('If `fetch::end::unknown` is received, then the code should be parsed and the `parse::end::vue` event emitted', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<VueEvents> = new EventEmitter2({}) as Engine<VueEvents>;

    new VueParser.default(engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::unknown', {
        resource: {},
        response: {}
    } as FetchEnd);

    const args = engineEmitAsyncSpy.args;

    t.is(args[1][0], 'parse::start::vue');
    t.is(args[2][0], 'parse::end::vue');

    sandbox.restore();
});
