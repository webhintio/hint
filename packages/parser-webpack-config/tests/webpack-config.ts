import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as path from 'path';
import * as proxyquire from 'proxyquire';

const misc = { getPackage() { } };

proxyquire('../src/parser', { 'sonarwhal/dist/src/lib/utils/misc': misc });

import WebpackConfigParser from '../src/parser';

test.beforeEach((t) => {
    t.context.sonarwhal = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test('If any file is parsed, it should emit a `parse::webpack-config::error::not-found` error', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new WebpackConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('scan::end', {});

    // 2 times, the previous call, and the expected call.
    t.true(t.context.sonarwhal.emitAsync.calledTwice);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'parse::webpack-config::error::not-found');

    sandbox.restore();
});

test(`If the resource isn't the webpack configuration, nothing should happen`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new WebpackConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('fetch::end::script', { resource: 'notawebpackconfiguration.json' });

    // The previous call.
    t.true(t.context.sonarwhal.emitAsync.calledOnce);

    sandbox.restore();
});

test('If the file contains an invalid configuration, it should fail', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    new WebpackConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('fetch::end::script', { resource: path.join(__dirname, 'fixtures', 'invalid-config', 'webpack.config.js') });

    // 2 times, the previous call, and the expected call.
    t.true(t.context.sonarwhal.emitAsync.calledTwice);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'parse::webpack-config::error::configuration');
    t.is(t.context.sonarwhal.emitAsync.args[1][1].error.message, 'Invalid or unexpected token');

    sandbox.restore();
});

test.serial('If the configuration is valid and webpack is installed locally, it should emit the event parse::webpack-config::end', async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');
    sandbox.stub(misc, 'getPackage').returns({ version: '4.0.0' });

    new WebpackConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    const config = await import(configPath);

    await t.context.sonarwhal.emitAsync('fetch::end::script', { resource: configPath });

    await t.context.sonarwhal.emitAsync('scan::end');

    // 3 times, the two previous call and the parse.
    t.is(t.context.sonarwhal.emitAsync.callCount, 3);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'parse::webpack-config::end');
    t.deepEqual(t.context.sonarwhal.emitAsync.args[1][1].config, config);

    sandbox.restore();
});

test.serial(`If the configuration is valid but webpack isn't installed locally, it should emit the event parse::webpack-config::error::not-install`, async (t) => {
    const configPath = path.join(__dirname, 'fixtures', 'valid', 'webpack.config.js');
    const sandbox = sinon.createSandbox();

    sandbox.spy(t.context.sonarwhal, 'emitAsync');
    sandbox.stub(misc, 'getPackage').throws(new Error('error'));

    new WebpackConfigParser(t.context.sonarwhal); // eslint-disable-line no-new

    await t.context.sonarwhal.emitAsync('fetch::end::script', { resource: configPath });

    await t.context.sonarwhal.emitAsync('scan::end');

    // 3 times, the two previous call and the error.
    t.is(t.context.sonarwhal.emitAsync.callCount, 3);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'parse::webpack-config::error::not-install');

    sandbox.restore();
});
