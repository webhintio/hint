import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

test('It posts telemetry events in the correct format', async (t) => {
    const instrumentationKey = 'foo';
    const post = sinon.stub().resolves(200);

    const { initTelemetry, trackEvent } = proxyquire('../../src/utils/app-insights', {}) as typeof import('../../src/utils/app-insights');

    initTelemetry({
        batchDelay: 0,
        enabled: true,
        instrumentationKey,
        post
    });

    await trackEvent('test-event', { 'hint-one': 'pass' }, { 'test-time': 500 });

    const postData = JSON.parse(post.firstCall.args[1]);

    t.is(post.callCount, 1);
    t.is(post.firstCall.args[0], 'https://dc.services.visualstudio.com/v2/track');
    t.is(postData.length, 1);
    t.is(postData[0].iKey, instrumentationKey);
    t.is(postData[0].name, `Microsoft.ApplicationInsights.${instrumentationKey.replace(/-/g, '')}.Event`);
    t.is(postData[0].time, new Date(postData[0].time).toISOString());
});

test('It does not post telemetry events when disabled', async (t) => {
    const instrumentationKey = 'foo';
    const post = sinon.stub().resolves();

    const { initTelemetry, trackEvent, updateTelemetry } = proxyquire('../../src/utils/app-insights', {}) as typeof import('../../src/utils/app-insights');

    initTelemetry({
        batchDelay: 0,
        enabled: true,
        instrumentationKey,
        post
    });

    updateTelemetry(false);

    await trackEvent('test-event', { 'hint-one': 'pass' }, { 'test-time': 500 });

    t.is(post.callCount, 0);
});

test('It batches multiple telemetry events together', async (t) => {
    const instrumentationKey = 'foo';
    const post = sinon.stub().resolves(200);

    const { initTelemetry, trackEvent } = proxyquire('../../src/utils/app-insights', {}) as typeof import('../../src/utils/app-insights');

    initTelemetry({
        batchDelay: 50,
        enabled: true,
        instrumentationKey,
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
    t.is(items[0].data.baseData.name, 'test-event-1');
    t.is(items[1].data.baseData.name, 'test-event-2');
});
