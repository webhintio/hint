import * as path from 'path';

import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import { Engine, ErrorEvent, FetchEnd, ScanEnd } from 'hint';
import * as utils from '@hint/utils';

import { WebpackConfigEvents, WebpackConfigParse } from '../src/parser';

type SandboxContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<SandboxContext>;

const mockContext = (context: SandboxContext) => {
    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<WebpackConfigEvents>;

    const packages = {
        loadPackage: () => {
            return { version: '' };
        }
    };


    const loadPackageStub = context.sandbox.stub(packages, 'loadPackage');

    const script = proxyquire('../src/parser', {
        '@hint/utils': { network: utils.network },
        '@hint/utils/dist/src/packages/load-package': { loadPackage: loadPackageStub }
    });

    return {
        engine,
        loadPackageStub,
        WebpackConfigParser: script.default
    };
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('If any file is parsed, it should emit a `parse::error::webpack-config::not-found` error', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, WebpackConfigParser } = mockContext(t.context);

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('scan::end', {} as ScanEnd);

    // 2 times, the previous call, and the expected call.
    t.true(engineEmitAsyncSpy.calledTwice);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::error::webpack-config::not-found');
});

test(`If the resource isn't the webpack configuration, nothing should happen`, async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, WebpackConfigParser } = mockContext(t.context);

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::script', { resource: 'notawebpackconfiguration.json' } as FetchEnd);

    // The previous call.
    t.true(engineEmitAsyncSpy.calledOnce);
});

test('If the file contains an invalid configuration, it should fail', async (t) => {
    const sandbox = t.context.sandbox;
    const { engine, WebpackConfigParser } = mockContext(t.context);

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::script', { resource: path.join(__dirname, 'fixtures', 'invalid-config', 'webpack.config.js') } as FetchEnd);

    // 3 times, the previous call, the parse start, and the expected call.
    t.true(engineEmitAsyncSpy.calledThrice);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::webpack-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::webpack-config::configuration');
    t.is((engineEmitAsyncSpy.args[2][1] as ErrorEvent).error.message, 'Invalid or unexpected token');
});

test('If the configuration is valid and webpack is installed locally, it should emit the event parse::end::webpack-config', async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = t.context.sandbox;
    const { engine, loadPackageStub, WebpackConfigParser } = mockContext(t.context);

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    loadPackageStub.returns({ version: '4.0.0' });

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    const config = await import(configPath);

    await engine.emitAsync('fetch::end::script', { resource: configPath } as FetchEnd);

    await engine.emitAsync('scan::end', {} as ScanEnd);

    // 4 times, the two previous call and the parse start/end.
    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::webpack-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::end::webpack-config');
    t.deepEqual((engineEmitAsyncSpy.args[2][1] as WebpackConfigParse).config, config);
});

test(`If the configuration is valid but webpack isn't installed locally, it should emit the event parse::error::webpack-config::not-install`, async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = t.context.sandbox;
    const { engine, loadPackageStub, WebpackConfigParser } = mockContext(t.context);

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    loadPackageStub.throws(new Error('error'));

    new WebpackConfigParser(engine); // eslint-disable-line no-new

    await engine.emitAsync('fetch::end::script', { resource: configPath } as FetchEnd);

    await engine.emitAsync('scan::end', {} as ScanEnd);

    // 4 times, the two previous call, the parse start, and the error.
    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::webpack-config');
    t.is(engineEmitAsyncSpy.args[2][0], 'parse::error::webpack-config::not-install');
});
