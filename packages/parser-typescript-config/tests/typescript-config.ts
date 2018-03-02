import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import TypeScriptConfigParser from '../src/typescript-config';

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

    new TypeScriptConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('scan::end', {});

    // 2 times, the previous call, and the expected call.
    t.true(t.context.sonarwhal.emitAsync.calledTwice);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'notfound::typescript-config');

    sandbox.restore();
});

test.serial(`If the resource doesn't match the regex, nothing should happen`, async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new TypeScriptConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('fetch::end::json', { resource: 'tsconfignotvalidname.json' });

    // The previous call.
    t.true(t.context.sonarwhal.emitAsync.calledOnce);

    sandbox.restore();
});

test.serial('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new TypeScriptConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: '{"invalidJson}' } }
    });

    // 2 times, the previous call, and the expected call.
    t.true(t.context.sonarwhal.emitAsync.calledTwice);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'invalid-json::typescript-config');
    t.is(t.context.sonarwhal.emitAsync.args[1][1].error.message, 'Unexpected end of JSON input');

    sandbox.restore();
});

test.serial('If the file contains an invalid schema, it should fail', async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new TypeScriptConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    const invalidSchema = {
        compilerOptions: {
            alwaysStrict: true,
            declaration: true,
            inlineSourceMap: true,
            lib: [
                'dom',
                'dom.iterable',
                'invalid.value',
                'esnext',
                'esnext.asynciterable'
            ],
            module: 'commonjs',
            newLine: 'lf',
            removeComments: false,
            target: 'esnext'
        }
    };

    await t.context.sonarwhal.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: JSON.stringify(invalidSchema) } }
    });

    // 3 times, the previous call, the invalid schema and the parse.
    t.is(t.context.sonarwhal.emitAsync.callCount, 3);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'invalid-schema::typescript-config');
    t.is(t.context.sonarwhal.emitAsync.args[1][1].errors[0].data, 'invalid.value');
    t.is(t.context.sonarwhal.emitAsync.args[1][1].errors[0].message, 'should be equal to one of the allowed values');
    t.is(t.context.sonarwhal.emitAsync.args[2][0], 'parse::typescript-config');
    t.deepEqual(t.context.sonarwhal.emitAsync.args[2][1].config, invalidSchema);

    sandbox.restore();
});

test.serial('If the file contains a valid schema, it should pass', async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new TypeScriptConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    const validSchema = {
        compilerOptions: {
            alwaysStrict: true,
            declaration: true,
            inlineSourceMap: true,
            lib: [
                'dom',
                'dom.iterable',
                'esnext',
                'esnext.asynciterable'
            ],
            module: 'commonjs',
            newLine: 'lf',
            removeComments: false,
            target: 'esnext'
        }
    };

    await t.context.sonarwhal.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: JSON.stringify(validSchema) } }
    });

    await t.context.sonarwhal.emitAsync('scan::end');

    // 3 times, the two previous call and the parse.
    t.is(t.context.sonarwhal.emitAsync.callCount, 3);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'parse::typescript-config');
    t.deepEqual(t.context.sonarwhal.emitAsync.args[1][1].config, validSchema);

    sandbox.restore();
});
