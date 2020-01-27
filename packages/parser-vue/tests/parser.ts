import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { FetchEnd } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { HTMLEvents } from '@hint/parser-html';
import { ScriptEvents } from '@hint/parser-javascript';

import * as VueParser from '../src/parser';
// import { VueEvents } from '../src/types';

test('If `fetch::end::unknown` is received, then the code should be parsed and the `parse::end::vue` event emitted', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<HTMLEvents & ScriptEvents> = new EventEmitter2({}) as Engine<HTMLEvents & ScriptEvents>;

    new VueParser.default(engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::unknown', {
        resource: 'some.vue',
        response: {}
    } as FetchEnd);

    const args = engineEmitAsyncSpy.args;

    t.is(args[1][0], 'parse::start::html');
    // t.is(args[2][0], 'parse::end::html');

    sandbox.restore();
});
