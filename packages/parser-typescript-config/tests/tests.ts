import * as path from 'path';
import * as url from 'url';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

type StatObject = {
    mtime: Date;
};

const statObject: StatObject = { mtime: new Date() };

const fs = {
    stat(path: string, callback: Function): void {
        return callback(null, statObject);
    }
};

const schema = readFile(path.join(__dirname, 'fixtures', 'schema.json'));

const requestAsync = {
    default(url: string): Promise<string> {
        return Promise.resolve(schema);
    }
};

const writeFileAsync = {
    default(path: string, content: string): Promise<void> {
        return Promise.resolve();
    }
};


proxyquire('../src/parser', {
    fs,
    'hint/dist/src/lib/utils/fs/write-file-async': writeFileAsync,
    'hint/dist/src/lib/utils/network/request-async': requestAsync
});

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

test.serial('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: 'invalidJson' } }
    });

    // 3 times, the previous call, the start and the expected call.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::start::typescript-config');
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::error::typescript-config::json');
    t.is(t.context.engine.emitAsync.args[2][1].error.message, 'Unexpected token i in JSON at position 0');

    sandbox.restore();
});

test.serial('If the file contains a valid json with an invalid schema, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: '{"compilerOptions": { "invalidProperty": "invalid value" }}' } }
    });

    // 3 times, the previous call, the start and the expected call.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::error::typescript-config::schema');
    t.is(t.context.engine.emitAsync.args[2][1].errors[0].message, 'should NOT have additional properties');

    sandbox.restore();
});

test.serial('If we receive a valid json with a valid name, it should emit the event parse::end::typescript-config', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid.json'));

    const parsedJSON = {
        compilerOptions:
        {
            alwaysStrict: true,
            declaration: true,
            disableSizeLimit: false,
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
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::end::typescript-config');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].originalConfig, validJSON);
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, parsedJSON);

    sandbox.restore();
});

test.serial('If we receive a valid json with an extends, it should emit the event parse::end::typescript-config with the right data', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends.json'));

    const parsedJSON = {
        compilerOptions:
        {
            alwaysStrict: true,
            declaration: true,
            disableSizeLimit: false,
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
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends.json'))!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 times, the previous call, the start parse and the parse.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::end::typescript-config');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].originalConfig, validJSON);
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, parsedJSON);

    sandbox.restore();
});

test.serial('If we receive a json with an extends with a loop, it should emit the event parse::error::typescript-config::circular', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const configuration = readFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-loop.json'));

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-loop.json'))!),
        response: { body: { content: configuration } }
    });

    // 3 times, the previous call, the start and the parse error.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::error::typescript-config::circular');

    sandbox.restore();
});

test.serial('If we receive a json with an extends with an invalid json, it should emit the event parse::error::typescript-config::extends', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const configuration = readFile(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-invalid.json'));

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(path.join(__dirname, 'fixtures', 'tsconfig.valid-with-extends-invalid.json'))!),
        response: { body: { content: configuration } }
    });

    // 3 times, the previous call, the start and the parse error.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::error::typescript-config::extends');

    sandbox.restore();
});

test.serial(`If the schema file was updated in less than 24 hours, it shouldn't update the current schema`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    const fsStatStub = sandbox.stub(fs, 'stat').callsFake((path: string, callback) => {
        callback(null, { mtime: new Date() });
    });
    const requestAsyncSpy = sandbox.spy(requestAsync, 'default');
    const writeFileAsyncSpy = sandbox.spy(writeFileAsync, 'default');

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid.json'));

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    t.true(fsStatStub.calledOnce);
    t.false(requestAsyncSpy.called);
    t.false(writeFileAsyncSpy.called);

    sandbox.restore();
});

test.serial(`If the schema file wasn't updated in less than 24 hours, it should update the current schema`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    const today = new Date();
    const dayBeforeYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);

    const fsStatStub = sandbox.stub(fs, 'stat').callsFake((path: string, callback) => {
        callback(null, { mtime: dayBeforeYesterday });
    });
    const requestAsyncStub = sandbox.stub(requestAsync, 'default').resolves(schema);
    const writeFileAsyncStub = sandbox.stub(writeFileAsync, 'default').resolves();

    new TypeScriptConfigParser(t.context.engine); // eslint-disable-line no-new

    const validJSON = loadJSONFile(path.join(__dirname, 'fixtures', 'tsconfig.valid.json'));

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'tsconfig.improved.json',
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    t.true(fsStatStub.calledOnce);
    t.true(requestAsyncStub.calledOnce);
    t.is(requestAsyncStub.args[0][0], 'http://json.schemastore.org/tsconfig');
    t.true(writeFileAsyncStub.calledOnce);

    const oldSchema = JSON.parse(schema);
    const newSchema = JSON.parse(writeFileAsyncStub.args[0][1]);

    t.is(typeof oldSchema.definitions.compilerOptionsDefinition.properties.compilerOptions.additionalProperties, 'undefined');
    t.is(typeof oldSchema.definitions.typeAcquisitionDefinition.properties.typeAcquisition.additionalProperties, 'undefined');
    t.false(newSchema.definitions.compilerOptionsDefinition.properties.compilerOptions.additionalProperties);
    t.false(newSchema.definitions.typeAcquisitionDefinition.properties.typeAcquisition.additionalProperties);

    sandbox.restore();
});
