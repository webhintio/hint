import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import { EventEmitter2 } from 'eventemitter2';
import anyTest, { TestInterface } from 'ava';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';
import { Engine } from 'hint';

import PackageJsonParser, { PackageJsonEvents } from '../src/parser';
import { FetchEnd } from 'hint/dist/src/lib/types';

type ParserPackageJsonContext = {
    engine: Engine<PackageJsonEvents>;
    engineEmitAsyncSpy: sinon.SinonSpy;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ParserPackageJsonContext>;

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

test.beforeEach((t) => {
    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<PackageJsonEvents>;

    new PackageJsonParser(engine); // eslint-disable-line no-new

    t.context.engine = engine;
    t.context.sandbox = sinon.createSandbox();
    t.context.engineEmitAsyncSpy = t.context.sandbox.spy(engine, 'emitAsync');
});

test.afterEach((t) => {
    t.context.sandbox.restore();
});

test('If we receive a valid package.json, it should emit the event parse::end::package-json', async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    // 3 calls, fetch json, parse start and parse end.
    t.is(t.context.engineEmitAsyncSpy.callCount, 3);
    t.is(t.context.engineEmitAsyncSpy.args[1][0], 'parse::start::package-json');
    t.is(t.context.engineEmitAsyncSpy.args[2][0], 'parse::end::package-json');
});

test('If we receive a valid package.json, it should emit exactly the contents of the file', async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    t.deepEqual(t.context.engineEmitAsyncSpy.args[2][1].config, validJSON);
});

test('If the .json file being fetched is not package.json, the only event emitted should be fetch::end::json.', async (t) => {
    t.context.sandbox.stub(path, 'basename').returns('foo.json');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    t.true(t.context.engineEmitAsyncSpy.calledOnce);
    t.is(t.context.engineEmitAsyncSpy.args[0][0], 'fetch::end::json');
});

test(`Even if package.json contains an invalid schema, it should still emit the 'parse::start::package-json' event`, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(t.context.engineEmitAsyncSpy.args[1][0], 'parse::start::package-json');
});

test(`If package.json contains an invalid schema, it should emit an error related to the schema of the package.json`, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(t.context.engineEmitAsyncSpy.args[2][0], 'parse::error::package-json::schema');
});

test(`If package.json contains an invalid schema, it should emit an array containing the errors `, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(Object.keys(t.context.engineEmitAsyncSpy.args[2][1]).includes('errors'), true);
    t.is(Array.isArray(t.context.engineEmitAsyncSpy.args[2][1].errors), true);
    t.is(t.context.engineEmitAsyncSpy.args[2][1].errors.length, 1);
});

test(`If package.json contains an invalid schema, it should emit an array of errors that is easily understandable `, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    } as FetchEnd);

    t.is(Object.keys(t.context.engineEmitAsyncSpy.args[2][1]).includes('prettifiedErrors'), true);
    t.is(Array.isArray(t.context.engineEmitAsyncSpy.args[2][1].prettifiedErrors), true);
    t.is(t.context.engineEmitAsyncSpy.args[2][1].prettifiedErrors.length, 1);
});

test(`If the file contains an invalid json, it should emit an error related to the json format of the package.json`, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: 'invalidJson' } }
    } as FetchEnd);

    // 2 calls, fetch json, and the error.
    t.is(t.context.engineEmitAsyncSpy.callCount, 2);
    t.is(t.context.engineEmitAsyncSpy.args[1][0], 'parse::error::package-json::json');
});

test(`If 'package.json' contains a custom property (e.g. 'browserslist'), it should still emit the event parse::end::package-json`, async (t) => {
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

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: nonStandardJSON } }
    } as FetchEnd);

    // 3 calls, fetch json, parse start and parse end.
    t.is(t.context.engineEmitAsyncSpy.callCount, 3);
    t.is(t.context.engineEmitAsyncSpy.args[2][0], 'parse::end::package-json');
});
