import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

import TypeScriptConfigParser from '../src/parser';

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test(`If the resource doesn't match the regex, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::json', { resource: 'tsconfignotvalidname.json' });

    // The previous call.
    t.true(t.context.engine.emitAsync.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: '{"invalidJson}' } }
    });

    // 3 times, the previous call, the start and the expected call.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::typescript-config::start');
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::typescript-config::error::json');
    t.is(t.context.engine.emitAsync.args[2][1].error.message, 'Unexpected end of JSON input');

    sandbox.restore();
});

test('If the file contains a valid json with an invalid schema, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: '{"compilerOptions": { "invalidProperty": "invalid value" }}' } }
    });

    // 3 times, the previous call, the start and the expected call.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::typescript-config::error::schema');
    t.is(t.context.engine.emitAsync.args[2][1].errors[0].message, 'should NOT have additional properties');

    sandbox.restore();
});

test('If we receive a valid json with a valid name, it should emit the event parse::typescript-config::end', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid.json'));

    const parsedJSON = {
        compilerOptions:
        {
            alwaysStrict: true,
            declaration: true,
            inlineSourceMap: true,
            jsxFactory: 'React.createElement',
            lib: [
                'dom',
                'dom.iterable',
                'esnext',
                'esnext.asynciterable'
            ],
            maxNodeModuleJsDepth: 0,
            module: 'commonjs',
            moduleResolution: 'classic',
            newLine: 'lf',
            removeComments: false,
            target: 'esnext'
        }
    };

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 times, the previous call, the start and the parse.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::typescript-config::end');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].originalConfig, validJSON);
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, parsedJSON);

    sandbox.restore();
});

test('If we receive a valid json with an extends, it should emit the event parse::typescript-config::end with the right data', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends.json'));

    const parsedJSON = {
        compilerOptions:
        {
            alwaysStrict: true,
            declaration: true,
            inlineSourceMap: true,
            jsxFactory: 'React.createElement',
            lib: [
                'dom',
                'dom.iterable',
                'esnext',
                'esnext.asynciterable'
            ],
            maxNodeModuleJsDepth: 0,
            module: 'esnext',
            moduleResolution: 'classic',
            newLine: 'lf',
            removeComments: false,
            target: 'esnext'
        }
    };

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends.json'))),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 times, the previous call, the start parse and the parse.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::typescript-config::end');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].originalConfig, validJSON);
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, parsedJSON);

    sandbox.restore();
});

test('If we receive a json with an extends with a loop, it should emit the event parse::typescript-config::error::circular', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const configuration = readFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-loop.json'));

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-loop.json'))),
        response: { body: { content: configuration } }
    });

    // 3 times, the previous call, the start and the parse error.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::typescript-config::error::circular');

    sandbox.restore();
});

test('If we receive a json with an extends with an invalid json, it should emit the event parse::typescript-config::error::extends', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const configuration = readFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-invalid.json'));

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-invalid.json'))),
        response: { body: { content: configuration } }
    });

    // 3 times, the previous call, the start and the parse error.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::typescript-config::error::extends');

    sandbox.restore();
});
