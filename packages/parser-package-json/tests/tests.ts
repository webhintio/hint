import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import { EventEmitter2 } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import anyTest, { TestInterface } from 'ava';

import { fs, network } from '@hint/utils';
import { Engine, FetchEnd } from 'hint';

import { PackageJsonEvents } from '../src/parser';

const { loadJSONFile } = fs;
const { getAsUri } = network;

type SandboxContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<SandboxContext>;

const validPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const validJSON = loadJSONFile(validPath);
const invalidJSON = `{
    "name": "app",
    "version":  "1.0.0",
    "scripts": [
      "echo "Error: no test specified" && exit 1"
    ],
    "dependencies": {
      "extend": "3.0.2"
    },
    "devDependencies": {
      "gulp": "^4.0.0"
    }
  }`;

const mockContext = (sandbox: sinon.SinonSandbox) => {
    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<PackageJsonEvents>;

    const engineEmitAsyncSpy: sinon.SinonSpy<any, any> = sandbox.spy(engine, 'emitAsync');

    return { engine, engineEmitAsyncSpy };
};

const loadScript = (mockPath: boolean = false) => {
    const newPath = {
        basename(): string {
            return 'foo';
        }
    };

    const script = proxyquire('../src/parser', mockPath ? { path: newPath } : {});

    return script.default;
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('If we receive a valid package.json, it should emit the event parse::end::package-json', async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    // 3 calls, fetch json, parse start and parse end.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::package-json');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::end::package-json');
});

test('If we receive a valid package.json, it should emit exactly the contents of the file', async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    t.deepEqual(engineEmitAsyncSpy.args[2][1].config, validJSON);
});

test('If the .json file being fetched is not package.json, the only event emitted should be fetch::end::json.', async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript(true);

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    t.true(engineEmitAsyncSpy.calledOnce);
    t.is(engineEmitAsyncSpy.args[0][0], 'fetch::end::json');
});

test(`Even if package.json contains an invalid schema, it should still emit the 'parse::start::package-json' event`, async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::package-json');
});

test(`If package.json contains an invalid schema, it should emit an error related to the schema of the package.json`, async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::package-json::schema');
});

test(`If package.json contains an invalid schema, it should emit an array containing the errors `, async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(Object.keys(engineEmitAsyncSpy.args[2][1]).includes('errors'), true);
    t.is(Array.isArray(engineEmitAsyncSpy.args[2][1].errors), true);
    t.is(engineEmitAsyncSpy.args[2][1].errors.length, 1);
});

test(`If package.json contains an invalid schema, it should emit an array of errors that is easily understandable `, async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(Object.keys(engineEmitAsyncSpy.args[2][1]).includes('prettifiedErrors'), true);
    t.is(Array.isArray(engineEmitAsyncSpy.args[2][1].prettifiedErrors), true);
    t.is(engineEmitAsyncSpy.args[2][1].prettifiedErrors.length, 1);
});

test(`If the file contains an invalid json, it should emit an error related to the json format of the package.json`, async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: 'invalidJson' } }
    } as FetchEnd);

    // 2 calls, fetch json, and the error.
    t.is(engineEmitAsyncSpy.callCount, 2);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::error::package-json::json');
});

test(`If 'package.json' contains a custom property (e.g. 'browserslist'), it should still emit the event parse::end::package-json`, async (t) => {
    const { engine, engineEmitAsyncSpy } = mockContext(t.context.sandbox);
    const PackageJsonParser = loadScript();

    new PackageJsonParser(engine); // eslint-disable-line no-new

    const nonStandardJSON = `{
        "name": "app",
        "scripts": {
          "test": "echo "Error: no test specified" && exit 1",
        },
        "browserslist": [
            "last 1 version",
          ]
        "dependencies": {
          "extend": "3.0.2"
        },
        "devDependencies": {
          "gulp": "^4.0.0"
        }
      }`;

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: nonStandardJSON } }
    } as FetchEnd);

    // 3 calls, fetch json, parse start and parse end.
    t.is(engineEmitAsyncSpy.callCount, 3);
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::end::package-json');
});
