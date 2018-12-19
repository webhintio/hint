import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import { EventEmitter2 } from 'eventemitter2';
import test from 'ava';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

import PackageJsonParser from '../src/parser';

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

let sandbox: sinon.SinonSandbox;

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });

    new PackageJsonParser(t.context.engine); // eslint-disable-line no-new

    sandbox = sinon.createSandbox();
    sandbox.spy(t.context.engine, 'emitAsync');
});

test.afterEach((t) => {
    sandbox.restore();
});

test.serial('If we receive a valid package.json, it should emit the event parse::end::package-json', async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 calls, fetch json, parse start and parse end.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::start::package-json');
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::end::package-json');
});

test.serial('If we receive a valid package.json, it should emit exactly the contents of the file', async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, validJSON);
});

test.serial('If the .json file being fetched is not package.json, the only event emitted should be fetch::end::json.', async (t) => {
    sandbox.stub(path, 'basename').returns('foo.json');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(validPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    t.true(t.context.engine.emitAsync.calledOnce);
    t.is(t.context.engine.emitAsync.args[0][0], 'fetch::end::json');
});

test.serial(`Even if package.json contains an invalid schema, it should still emit the 'parse::start::package-json' event`, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    });

    t.is(t.context.engine.emitAsync.args[1][0], 'parse::start::package-json');
});

test.serial(`If package.json contains an invalid schema, it should emit an error related to the schema of the package.json`, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    });

    t.is(t.context.engine.emitAsync.args[2][0], 'parse::error::package-json::schema');
});

test.serial(`If package.json contains an invalid schema, it should emit an array containing the errors `, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    });

    t.is(Object.keys(t.context.engine.emitAsync.args[2][1]).includes('errors'), true);
    t.is(Array.isArray(t.context.engine.emitAsync.args[2][1].errors), true);
    t.is(t.context.engine.emitAsync.args[2][1].errors.length, 1);
});

test.serial(`If package.json contains an invalid schema, it should emit an array of errors that is easily understandable `, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidJSON } }
    });

    t.is(Object.keys(t.context.engine.emitAsync.args[2][1]).includes('prettifiedErrors'), true);
    t.is(Array.isArray(t.context.engine.emitAsync.args[2][1].prettifiedErrors), true);
    t.is(t.context.engine.emitAsync.args[2][1].prettifiedErrors.length, 1);
});

test.serial(`If the file contains an invalid json, it should emit an error related to the json format of the package.json`, async (t) => {
    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: 'invalidJson' } }
    });

    // 2 calls, fetch json, and the error.
    t.is(t.context.engine.emitAsync.callCount, 2);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::error::package-json::json');
});

test.serial(`If 'package.json' contains a non standard property, it should still emit the event parse::end::package-json`, async (t) => {
    const nonStandardJSON = `{
        "name": "app",
        "foo":  "1.0.0",
        "scripts": {
          "test": "echo "Error: no test specified" && exit 1",
        },
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
    });

    // 3 calls, fetch json, parse start and parse end.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::end::package-json');
});
