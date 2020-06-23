import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

test('It posts telemetry events in the correct format', async (t) => {
    const post = sinon.stub().resolves(200);

    const { initTelemetry, trackEvent } = proxyquire('../src/telemetry-api', {}) as typeof import('../src/telemetry-api');

    initTelemetry({
        batchDelay: 0,
        enabled: true,
        post
    });

    await trackEvent('test-event', { 'hint-one': 'pass' }, { 'test-time': 500 });

    const postData = JSON.parse(post.firstCall.args[1]);

    t.is(post.callCount, 1);
    t.is(post.firstCall.args[0], 'https://webhint-telemetry.azurewebsites.net/api/log');
    t.is(postData.length, 1);
    t.is(postData[0].data.name, 'test-event');
    t.is(postData[0].time, new Date(postData[0].time).toISOString());
});

test('It does not post telemetry events when disabled', async (t) => {
    const post = sinon.stub().resolves();

    const { initTelemetry, trackEvent, updateTelemetry } = proxyquire('../src/telemetry-api', {}) as typeof import('../src/telemetry-api');

    initTelemetry({
        batchDelay: 0,
        enabled: true,
        post
    });

    updateTelemetry(false);

    await trackEvent('test-event', { 'hint-one': 'pass' }, { 'test-time': 500 });

    t.is(post.callCount, 0);
});

test('It batches multiple telemetry events together', async (t) => {
    const post = sinon.stub().resolves(200);

    const { initTelemetry, trackEvent } = proxyquire('../src/telemetry-api', {}) as typeof import('../src/telemetry-api');

    initTelemetry({
        batchDelay: 50,
        enabled: true,
        post
    });

    await trackEvent('test-event-1');
    await trackEvent('test-event-2');

    await new Promise((resolve) => {
        setTimeout(resolve, 100);
    });

    t.is(post.callCount, 1);

    const items = JSON.parse(post.firstCall.args[1]);

    t.is(items.length, 2);
    t.is(items[0].data.name, 'test-event-1');
    t.is(items[1].data.name, 'test-event-2');
});
