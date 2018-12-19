import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import { EventEmitter2 } from 'eventemitter2';
import test from 'ava';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

import PackageJsonParser from '../src/parser';

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test('If we receive a valid json with a valid name, it should emit the event parse::end::package-json', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new PackageJsonParser(t.context.engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
    const validJSON = loadJSONFile(configPath);

    const parsedJSON = {
        name: 'app',
        version: '1.0.0',
        description: '',
        main: 'index.js',
        scripts: { test: 'echo "Error: no test specified" && exit 1' },
        author: '',
        license: 'ISC',
        dependencies: { extend: '3.0.2' },
        devDependencies: { gulp: '^4.0.0' } 
    };

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 times, the previous call, the start parse and the end
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::end::package-json');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, validJSON);
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, parsedJSON);

    sandbox.restore();
});

test(`If the resource doesn't match the target file names, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();

    new PackageJsonParser(t.context.engine); // eslint-disable-line no-new
    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', { resource: '.packagejson' });

    t.true(t.context.engine.emitAsync.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    new PackageJsonParser(t.context.engine); // eslint-disable-line no-new
    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: 'invalidJson' } }
    });

    // 2 times, the previous call and the error
    t.is(t.context.engine.emitAsync.callCount, 2);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::error::package-json::json');

    sandbox.restore();
});

test(`If package.json contains an invalid schema, it should emit the 'parse::error::package-json::schema' event`, async (t) => {
    const sandbox = sinon.createSandbox();

    new PackageJsonParser(t.context.engine); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "name": "app",
        "version":  "1.0.0",
        "scripts": [
          "echo \"Error: no test specified\" && exit 1",
        ],
        "dependencies": {
          "extend": "3.0.2"
        },
        "devDependencies": {
          "gulp": "^4.0.0"
        }
      }
      `;

    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidSchemaContent } }
    });

    // 3 times, the previous call, the start parse and the error
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::start::package-json');
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::error::package-json::schema');

    sandbox.restore();
});

test(`If 'package.json' contains a non standard property, it should still emit the event parse::end::package-json`, async (t) => {
    const sandbox = sinon.createSandbox();
    const invalidSchemaContent = `{
        "name": "app",
        "foo":  "1.0.0",
        "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1",
        },
        "dependencies": {
          "extend": "3.0.2"
        },
        "devDependencies": {
          "gulp": "^4.0.0"
        }
      }`;

    new PackageJsonParser(t.context.engine); // eslint-disable-line no-new
    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidSchemaContent } }
    });

    // 3 times, the previous call, the start parse and the end
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::end::package-json');

    sandbox.restore();
});
