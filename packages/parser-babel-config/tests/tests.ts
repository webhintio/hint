import * as path from 'path';
import * as url from 'url';

import * as sinon from 'sinon';
import { EventEmitter2 } from 'eventemitter2';
import test from 'ava';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';
import { Engine } from 'hint';

import BabelConfigParser, { BabelConfigEvents, BabelConfigParsed } from '../src/parser';
import { FetchEnd } from 'hint/dist/src/lib/types';

test(`If the resource doesn't match the target file names, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    new BabelConfigParser(engine); // eslint-disable-line no-new
    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::json', { resource: '.babelrcconfig' } as FetchEnd);

    t.true(engineEmitAsyncSpy.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    new BabelConfigParser(engine); // eslint-disable-line no-new
    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::json', {
        resource: '.babelrc',
        response: { body: { content: 'invalidJson' } }
    } as FetchEnd);

    // 2 times, the previous call and the error
    t.is(engineEmitAsyncSpy.callCount, 2);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::error::babel-config::json');

    sandbox.restore();
});

test(`If .babelrc contains an invalid schema, it should emit the 'parse::error::babel-config::schema' event`, async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    new BabelConfigParser(engine); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "plugins": ["transform-react-jsx"],
        "moduleId": 1,
        "ignore": [
          "foo.js",
          "bar/**/*.js"
        ]
      }`;

    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::json', {
        resource: '.babelrc',
        response: { body: { content: invalidSchemaContent } }
    } as FetchEnd);

    // 3 times, the previous call, the start parse and the error
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[1][0], 'parse::start::babel-config');
    t.is(engineEmitASyncSpy.args[2][0], 'parse::error::babel-config::schema');

    sandbox.restore();
});

test(`If 'package.json' contains an invalid 'babel' property, it should emit the 'parse::error::babel-config::schema' event`, async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

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

    new BabelConfigParser(engine); // eslint-disable-line no-new
    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::json', {
        resource: 'package.json',
        response: { body: { content: invalidSchemaContent } }
    } as FetchEnd);

    // 3 times, the previous call, the start parse and the error
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[2][0], 'parse::error::babel-config::schema');

    sandbox.restore();
});

test('If the content type is unknown, it should still validate if the file name is a match', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    new BabelConfigParser(engine); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "plugins": ["transform-react-jsx"],
        "moduleId": 1,
        "ignore": [
          "foo.js",
          "bar/**/*.js"
        ]
      }`;

    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::json', {
        resource: '.babelrc',
        response: { body: { content: invalidSchemaContent } }
    } as FetchEnd);

    // 3 times, the previous call, the start parse and the error
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[2][0], 'parse::error::babel-config::schema');

    sandbox.restore();
});

test('If we receive a valid json with a valid name, it should emit the event parse::end::babel-config', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    new BabelConfigParser(engine); // eslint-disable-line no-new

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
    } as any;

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    const eventInfo: BabelConfigParsed = engineEmitASyncSpy.args[2][1] as BabelConfigParsed;

    // 3 times, the previous call, the start parse and the end
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[2][0], 'parse::end::babel-config');
    t.deepEqual(eventInfo.originalConfig, validJSON);
    t.deepEqual(eventInfo.config, parsedJSON);

    sandbox.restore();
});

test('If we receive a valid json with an extends, it should emit the event parse::end::babel-config with the right data', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    new BabelConfigParser(engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid-with-extends', '.babelrc');
    const validJSON = loadJSONFile(configPath);

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: JSON.stringify(validJSON) } }
    } as FetchEnd);

    const eventInfo: BabelConfigParsed = engineEmitASyncSpy.args[2][1] as BabelConfigParsed;

    // 3 times, the previous call, the start parse and the end
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[2][0], 'parse::end::babel-config');
    t.deepEqual(eventInfo.originalConfig, validJSON);
    t.is(((eventInfo.config.presets[0] as any)[1].targets).uglify, false);

    sandbox.restore();
});

test('If we receive a json with an extends with a loop, it should emit the event parse::error::babel-config::extends', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    new BabelConfigParser(engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid-with-extends-loop', '.babelrc');
    const configuration = readFile(configPath);

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: configuration } }
    } as FetchEnd);

    // 3 times, the previous call, the start parse and the error
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[2][0], 'parse::error::babel-config::extends');

    sandbox.restore();
});

test('If we receive a json with an extends with an invalid json, it should emit the event parse::error::typescript-config::extends', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<BabelConfigEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<BabelConfigEvents>;

    const engineEmitASyncSpy = sandbox.spy(engine, 'emitAsync');

    new BabelConfigParser(engine); // eslint-disable-line no-new

    const configPath = path.join(__dirname, 'fixtures', 'valid-with-extends-invalid', '.babelrc');
    const configuration = readFile(configPath);

    await engine.emitAsync('fetch::end::json', {
        resource: url.format(getAsUri(configPath)!),
        response: { body: { content: configuration } }
    } as FetchEnd);

    // 3 times, the previous call, the start parse and the error
    t.is(engineEmitASyncSpy.callCount, 3);
    t.is(engineEmitASyncSpy.args[2][0], 'parse::error::babel-config::extends');

    sandbox.restore();
});
