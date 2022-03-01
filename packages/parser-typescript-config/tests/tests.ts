import * as path from 'path';
import * as url from 'url';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestFn } from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import * as utilsFs from '@hint/utils-fs';
import { getAsUri } from '@hint/utils-network';
import { Engine, FetchEnd, ErrorEvent } from 'hint';

import { TypeScriptConfigEvents, TypeScriptConfigParse, TypeScriptConfigInvalidSchema } from '../src/parser';

const { loadJSONFile, readFile } = utilsFs;

type SandboxContext = {
    sandbox: sinon.SinonSandbox;
};


const test = anyTest as TestFn<SandboxContext>;

const schema = JSON.parse(readFile(path.join(__dirname, 'fixtures', 'schema.json')));

const mockContext = () => {
    const statObject = { mtime: new Date() };

    const fs = {
        stat(path: string, callback: Function): void {
            return callback(null, statObject);
        }
    };

    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<TypeScriptConfigEvents>;

    const script = proxyquire('../src/parser', {
        '@hint/utils-fs': {
            loadJSONFile() {
                return schema;
            }
        }
    });

    return {
        engine,
        fs,
        TypeScriptConfigParser: script.default
    };
};


test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test(`If the resource doesn't match the regex, nothing should happen`, async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', { resource: 'tsconfignotvalidname.json' } as FetchEnd);

    // The previous call.
    t.true(engineEmitAsyncSpy.calledOnce);
});

test(`If the resource is a tsconfig.schema.json file, nothing should happen`, async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', { resource: 'tsconfig.schema.json' } as FetchEnd);

    // The previous call.
    t.true(engineEmitAsyncSpy.calledOnce);
});

test('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: 'invalidJson' } }
    } as FetchEnd);

    // 3 times, the previous call, the start and the expected call.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::typescript-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::typescript-config::json');
    t.is((engineEmitAsyncSpy.args[2][1] as ErrorEvent).error.message, 'Unexpected token i in JSON at position 0');
});

test('If the file contains a valid json with an invalid schema, it should fail', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: `{ "compilerOptions": { "strict": 5 } }` } }
    } as FetchEnd);

    // 3 times, the previous call, the start and the expected call.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::typescript-config::schema');
    t.is((engineEmitAsyncSpy.args[2][1] as TypeScriptConfigInvalidSchema).errors[0].message, 'must be boolean');
});

test('If we receive a valid json with a valid name, it should emit the event parse::end::typescript-config', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid.json'));

    const parsedJSON = {
        compilerOptions:
        {
            alwaysStrict: true,
            declaration: true,
            disableSizeLimit: false,
            importsNotUsedAsValues: 'remove',
            inlineSourceMap: true,
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
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

    await engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    // 3 times, the previous call, the start and the parse.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::end::typescript-config');

    const data = engineEmitAsyncSpy.args[2][1] as TypeScriptConfigParse;

    t.deepEqual(data.originalConfig, validJSON);
    t.deepEqual(data.config, parsedJSON as any);
});

test('If we receive a valid json with an extends, it should emit the event parse::end::typescript-config with the right data', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends.json'));

    const parsedJSON = {
        compilerOptions:
        {
            alwaysStrict: true,
            declaration: true,
            disableSizeLimit: false,
            importsNotUsedAsValues: 'remove',
            inlineSourceMap: true,
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
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

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends.json'))!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    // 3 times, the previous call, the start parse and the parse.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::end::typescript-config');

    const data = engineEmitAsyncSpy.args[2][1] as TypeScriptConfigParse;

    t.deepEqual(data.originalConfig, validJSON);
    t.deepEqual(data.config, parsedJSON as any);

    sandbox.restore();
});

test('If we receive a json with an extends with a loop, it should emit the event parse::error::typescript-config::extends', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    const configuration = readFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-loop.json'));

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-loop.json'))!),
        response: { body: { content: configuration } }
    } as FetchEnd);

    // 3 times, the previous call, the start and the parse error.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::typescript-config::extends');
});

test('If we receive a json with an extends with an invalid json, it should emit the event parse::error::typescript-config::extends', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, TypeScriptConfigParser } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new TypeScriptConfigParser(engine); // eslint-disable-line no-new

    const configuration = readFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-invalid.json'));

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-invalid.json'))!),
        response: { body: { content: configuration } }
    } as FetchEnd);

    // 3 times, the previous call, the start and the parse error.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::typescript-config::extends');
});
