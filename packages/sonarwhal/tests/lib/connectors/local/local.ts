import * as path from 'path';

import * as sinon from 'sinon';
import test from 'ava';
import * as proxyquire from 'proxyquire';
import { getAsUri } from '../../../../src/lib/utils/get-as-uri';

const sonarwhal = { emitAsync() { } };

const misc = { isFile() { } };

proxyquire('../../../../src/lib/connectors/local/local', { misc: '../../utils/misc' });

import builder from '../../../../src/lib/connectors/local/local';

test.beforeEach((t) => {
    t.context.sonarwhal = sonarwhal;
});

test.serial(`If target is a file, it should emit 'fetch::start' event`, async (t) => {
    const fileUri = getAsUri(path.join(__dirname, 'fixtures', 'script.js'));

    const sandbox = sinon.createSandbox();

    sandbox.stub(misc, 'isFile').returns(true);
    sandbox.spy(sonarwhal, 'emitAsync');

    const connector = builder(sonarwhal, {});

    await connector.collect(fileUri);

    t.is(t.context.sonarwhal.emitAsync.callCount, 4);
    t.is(t.context.sonarwhal.emitAsync.args[0][0], 'scan::start');
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'fetch::start');
    t.is(t.context.sonarwhal.emitAsync.args[2][0], 'fetch::end::script');

    sandbox.restore();
});

test.serial(`If target is a html file, it should emit 'fetch::end::html' event instead of 'fetch::end'`, async (t) => {
    const fileUri = getAsUri(path.join(__dirname, 'fixtures', 'test.html'));

    const sandbox = sinon.createSandbox();

    sandbox.stub(misc, 'isFile').returns(true);
    sandbox.spy(sonarwhal, 'emitAsync');

    const connector = builder(sonarwhal, {});

    await connector.collect(fileUri);

    t.is(t.context.sonarwhal.emitAsync.callCount, 4);
    t.is(t.context.sonarwhal.emitAsync.args[0][0], 'scan::start');
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'fetch::start');
    t.is(t.context.sonarwhal.emitAsync.args[2][0], 'fetch::end::html');

    sandbox.restore();
});

test.serial(`If target is a file (text), 'content' is setted`, async (t) => {
    const fileUri = getAsUri(path.join(__dirname, 'fixtures', 'script.js'));

    const sandbox = sinon.createSandbox();

    sandbox.stub(misc, 'isFile').returns(true);
    sandbox.spy(sonarwhal, 'emitAsync');

    const connector = builder(sonarwhal, {});

    await connector.collect(fileUri);

    const event = t.context.sonarwhal.emitAsync.args[2][1];

    t.is(typeof event.response.body.content, 'string');
    t.not(event.response.body.content, '');

    sandbox.restore();
});

test.serial(`If target is a file (image), 'content' is empty`, async (t) => {
    const fileUri = getAsUri(path.join(__dirname, 'fixtures', 'stylish-output.png'));

    const sandbox = sinon.createSandbox();

    sandbox.stub(misc, 'isFile').returns(true);
    sandbox.spy(sonarwhal, 'emitAsync');

    const connector = builder(sonarwhal, {});

    await connector.collect(fileUri);

    const event = t.context.sonarwhal.emitAsync.args[2][1];

    t.is(typeof event.response.body.content, 'string');
    t.is(event.response.body.content, '');

    sandbox.restore();
});

test.serial(`If target is an image, 'content' is empty`, async (t) => {
    const fileUri = getAsUri(path.join(__dirname, 'fixtures', 'stylish-output.png'));

    const sandbox = sinon.createSandbox();

    sandbox.stub(misc, 'isFile').returns(true);
    sandbox.spy(sonarwhal, 'emitAsync');

    const connector = builder(sonarwhal, {});

    await connector.collect(fileUri);

    const event = t.context.sonarwhal.emitAsync.args[2][1];

    t.is(typeof event.response.body.content, 'string');
    t.is(event.response.body.content, '');

    sandbox.restore();
});

test.serial(`If target is a directory, shouldn't emit the event 'fetch::start'`, async (t) => {
    const directoryUri = getAsUri(path.join(__dirname, 'fixtures'));

    const sandbox = sinon.createSandbox();

    sandbox.stub(misc, 'isFile').returns(false);
    sandbox.spy(sonarwhal, 'emitAsync');

    const connector = builder(sonarwhal, {});

    await connector.collect(directoryUri);

    t.is(t.context.sonarwhal.emitAsync.callCount, 5);

    const events = t.context.sonarwhal.emitAsync.args.map((arg) => {
        return arg[0];
    }).sort();

    t.is(events[0], 'fetch::end::html');
    t.is(events[1], 'fetch::end::image');
    t.is(events[2], 'fetch::end::script');
    t.is(events[3], 'scan::end');
    t.is(events[4], 'scan::start');

    sandbox.restore();
});
