import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import * as TypeScriptConfigParser from '../../../src/lib/parsers/typescript-config/typescript-config';

test.beforeEach((t) => {
    t.context.sonarwhal = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test.serial('If any file is parsed, it should emit a `notfound::typescript-config` error', async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('scan::end', {});

    // 2 times, the previous call, and the expected call.
    t.true(t.context.sonarwhal.calledTwice);
    t.is(t.context.sonarwhal.args[1][0], 'notfound::typescript-config');
});

test.serial(`If the resource doesn't match the regex, nothing should happen`, async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('fetch::end', { resoruce: 'tsconfignotvalidname.json' });

    // The previous call.
    t.true(t.context.sonarwhal.calledOnce);
});

test.serial('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('fetch::end', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: '{"invalidJson}' } }
    });

    // The previous call.
    t.true(t.context.sonarwhal.calledOnce);
});
