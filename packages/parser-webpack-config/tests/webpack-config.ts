import * as path from 'path';

import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import { Engine } from 'hint';
import { ScanEnd, FetchEnd, ErrorEvent } from 'hint/dist/src/lib/types';

const loadPackage = {
    default() {
        return { version: '' };
    }
};

proxyquire('../src/parser', { 'hint/dist/src/lib/utils/packages/load-package': loadPackage });

import WebpackConfigParser, { WebpackConfigEvents, WebpackConfigParse } from '../src/parser';

const getEngine = (): Engine<WebpackConfigEvents> => {
    return new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<WebpackConfigEvents>;
};

test('If any file is parsed, it should emit a `parse::error::webpack-config::not-found` error', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('scan::end', {} as ScanEnd);

    // 2 times, the previous call, and the expected call.
    t.true(engineEmitAsyncSpy.calledTwice);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::error::webpack-config::not-found');

    sandbox.restore();
});

test(`If the resource isn't the webpack configuration, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::script', { resource: 'notawebpackconfiguration.json' } as FetchEnd);

    // The previous call.
    t.true(engineEmitAsyncSpy.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid configuration, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::script', { resource: path.join(__dirname, 'fixtures', 'invalid-config', 'webpack.config.js') } as FetchEnd);

    // 3 times, the previous call, the parse start, and the expected call.
    t.true(engineEmitAsyncSpy.calledThrice);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::webpack-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::webpack-config::configuration');
    t.is((engineEmitAsyncSpy.args[2][1] as ErrorEvent).error.message, 'Invalid or unexpected token');

    sandbox.restore();
});

test.serial('If the configuration is valid and webpack is installed locally, it should emit the event parse::end::webpack-config', async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    sandbox.stub(loadPackage, 'default').returns({ version: '4.0.0' });

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    const config = await import(configPath);

    await engine.emitAsync('fetch::end::script', { resource: configPath } as FetchEnd);

    await engine.emitAsync('scan::end', {} as ScanEnd);

    // 4 times, the two previous call and the parse start/end.
    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::webpack-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::end::webpack-config');
    t.deepEqual((engineEmitAsyncSpy.args[2][1] as WebpackConfigParse).config, config);

    sandbox.restore();
});

test.serial(`If the configuration is valid but webpack isn't installed locally, it should emit the event parse::error::webpack-config::not-install`, async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    sandbox.stub(loadPackage, 'default').throws(new Error('error'));

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::script', { resource: configPath } as FetchEnd);

    await engine.emitAsync('scan::end', {} as ScanEnd);

    // 4 times, the two previous call, the parse start, and the error.
    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::webpack-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::webpack-config::not-install');

    sandbox.restore();
});
