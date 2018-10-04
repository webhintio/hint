import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import { EventEmitter2 } from 'eventemitter2';
import test from 'ava';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';

import BabelConfigParser from '../src/parser';

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test(`If the resource doesn't match the target file names, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new
    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', { resource: '.babelrcconfig' });

    t.true(t.context.engine.emitAsync.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new
    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: '.babelrc',
        response: { body: { content: 'invalidJson' } }
    });

    // 2 times, the previous call and the error
    t.is(t.context.engine.emitAsync.callCount, 2);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::babel-config::error::json');

    sandbox.restore();
});

test(`If .babelrc contains an invalid schema, it should emit the 'parse::babel-config::error::schema' event`, async (t) => {
    const sandbox = sinon.createSandbox();

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "plugins": ["transform-react-jsx"],
        "moduleId": 1,
        "ignore": [
          "foo.js",
          "bar/**/*.js"
        ]
      }`;

    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: '.babelrc',
        response: { body: { content: invalidSchemaContent } }
    });

    // 3 times, the previous call, the start parse and the error
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::babel-config::start');
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::error::schema');

    sandbox.restore();
});

test(`If 'package.json' contains an invalid 'babel' property, it should emit the 'parse::babel-config::error::schema' event`, async (t) => {
    const sandbox = sinon.createSandbox();
    const invalidSchemaContent = `{
        "babel": {
          "plugins": ["transform-react-jsx"],
          "moduleId": 1,
          "ignore": [
            "foo.js",
            "bar/**/*.js"
          ]
        },
        "version": "0.0.1"
      }`;

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new
    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidSchemaContent } }
    });

    // 3 times, the previous call, the start parse and the error
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::error::schema');

    sandbox.restore();
});

test('If the content type is unknown, it should still validate if the file name is a match', async (t) => {
    const sandbox = sinon.createSandbox();

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "plugins": ["transform-react-jsx"],
        "moduleId": 1,
        "ignore": [
          "foo.js",
          "bar/**/*.js"
        ]
      }`;

    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: '.babelrc',
        response: { body: { content: invalidSchemaContent } }
    });

    // 3 times, the previous call, the start parse and the error
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::error::schema');

    sandbox.restore();
});

test('If we receive a valid json with a valid name, it should emit the event parse::babel-config::end', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid', '.babelrc');
    const validJSON = loadJSONFile(configPath);

    const parsedJSON = {
        ast: true,
        code: true,
        comments: true,
        compact: 'auto',
        env: {
            test: {
                presets:
                    [['env',
                        { targets: { node: 'current' } }]]
            }
        },
        filename: 'unknown',
        keepModuleIdExtensions: false,
        moduleIds: false,
        plugins: ['syntax-dynamic-import', 'transform-object-rest-spread'],
        presets: [['env', {
            modules: false,
            targets: {
                browsers:
                    ['last 2 versions', '> 5% in BE'],
                uglify: true
            }
        }]],
        retainLines: false,
        sourceMaps: false
    };

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 times, the previous call, the start parse and the end
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::end');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].originalConfig, validJSON);
    t.deepEqual(t.context.engine.emitAsync.args[2][1].config, parsedJSON);

    sandbox.restore();
});

test('If we receive a valid json with an extends, it should emit the event parse::babel-config::end with the right data', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid-with-extends', '.babelrc');
    const validJSON = loadJSONFile(configPath);

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    });

    // 3 times, the previous call, the start parse and the end
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::end');
    t.deepEqual(t.context.engine.emitAsync.args[2][1].originalConfig, validJSON);
    t.is(t.context.engine.emitAsync.args[2][1].config.presets[0][1].targets.uglify, false);

    sandbox.restore();
});

test('If we receive a json with an extends with a loop, it should emit the event parse::babel-config::error::circular', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid-with-extends-loop', '.babelrc');
    const configuration = readFile(configPath);

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: configuration } }
    });

    // 3 times, the previous call, the start parse and the error
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::error::circular');

    sandbox.restore();
});

test('If we receive a json with an extends with an invalid json, it should emit the event parse::typescript-config::error::extends', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new BabelConfigParser(t.context.engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid-with-extends-invalid', '.babelrc');
    const configuration = readFile(configPath);

    await t.context.engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: configuration } }
    });

    // 3 times, the previous call, the start parse and the error
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[2][0], 'parse::babel-config::error::extends');

    sandbox.restore();
});
