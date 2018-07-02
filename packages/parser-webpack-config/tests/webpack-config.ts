import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as path from 'path';
import * as proxyquire from 'proxyquire';

const loadPackage = { default() { } };

proxyquire('../src/parser', { 'hint/dist/src/lib/utils/packages/load-package': loadPackage });

import WebpackConfigParser from '../src/parser';

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test('If any file is parsed, it should emit a `parse::webpack-config::error::not-found` error', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new WebpackConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('scan::end', {});

    // 2 times, the previous call, and the expected call.
    t.true(t.context.engine.emitAsync.calledTwice);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::webpack-config::error::not-found');

    sandbox.restore();
});

test(`If the resource isn't the webpack configuration, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new WebpackConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::script', { resource: 'notawebpackconfiguration.json' });

    // The previous call.
    t.true(t.context.engine.emitAsync.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid configuration, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');

    new WebpackConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::script', { resource: path.join(__dirname, 'fixtures', 'invalid-config', 'webpack.config.js') });

    // 2 times, the previous call, and the expected call.
    t.true(t.context.engine.emitAsync.calledTwice);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::webpack-config::error::configuration');
    t.is(t.context.engine.emitAsync.args[1][1].error.message, 'Invalid or unexpected token');

    sandbox.restore();
});

test.serial('If the configuration is valid and webpack is installed locally, it should emit the event parse::webpack-config::end', async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');
    sandbox.stub(loadPackage, 'default').returns({ version: '4.0.0' });

    new WebpackConfigParser(t.context.engine); // eslint-disable-line no-new

    const config = await import(configPath);

    await t.context.engine.emitAsync('fetch::end::script', { resource: configPath });

    await t.context.engine.emitAsync('scan::end');

    // 3 times, the two previous call and the parse.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::webpack-config::end');
    t.deepEqual(t.context.engine.emitAsync.args[1][1].config, config);

    sandbox.restore();
});

test.serial(`If the configuration is valid but webpack isn't installed locally, it should emit the event parse::webpack-config::error::not-install`, async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.engine, 'emitAsync');
    sandbox.stub(loadPackage, 'default').throws(new Error('error'));

    new WebpackConfigParser(t.context.engine); // eslint-disable-line no-new

    await t.context.engine.emitAsync('fetch::end::script', { resource: configPath });

    await t.context.engine.emitAsync('scan::end');

    // 3 times, the two previous call and the error.
    t.is(t.context.engine.emitAsync.callCount, 3);
    t.is(t.context.engine.emitAsync.args[1][0], 'parse::webpack-config::error::not-install');

    sandbox.restore();
});
