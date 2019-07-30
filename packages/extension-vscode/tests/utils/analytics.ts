import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import * as _analytics from '../../src/utils/analytics';
import { IHintConstructor, Problem } from 'hint';

const mock = () => {
    const appInsights = { trackEvent: (name: string, properties: object) => {} };
    const analytics = proxyquire('../../src/utils/analytics', { '@hint/utils': { appInsights } }) as typeof _analytics;

    return { analytics, appInsights };
};

test('It tracks the first result for each document when opened', (t) => {
    const { analytics, appInsights } = mock();
    const trackEventSpy = sinon.spy(appInsights, 'trackEvent');

    // First result should be tracked.
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: [
            {
                hintId: 'foo',
                message: 'This should not be logged'
            } as Problem
        ]
    });

    // Second result should not be tracked (will be cached for 'onSave').
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: []
    });

    // First result for another document should be tracked.
    analytics.trackResult('test.css', {
        hints: [
            { meta: { id: 'bar' } } as IHintConstructor
        ],
        problems: []
    });

    t.true(trackEventSpy.calledTwice);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.firstCall.args[1], { 'hint-foo': 'failed' });
    t.is(trackEventSpy.secondCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.secondCall.args[1], { 'hint-bar': 'passed' });
});

test('It tracks the delta between the first and last results on save', (t) => {
    const { analytics, appInsights } = mock();
    const trackEventSpy = sinon.spy(appInsights, 'trackEvent');

    // First result should be tracked.
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'bar' } } as IHintConstructor,
            { meta: { id: 'baz' } } as IHintConstructor,
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: [
            { hintId: 'bar' } as Problem,
            { hintId: 'bar' } as Problem,
            { hintId: 'foo' } as Problem,
            { hintId: 'foo' } as Problem,
            { hintId: 'foo' } as Problem
        ]
    });

    // Second result should not be tracked (will be cached for 'onSave').
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'bar' } } as IHintConstructor,
            { meta: { id: 'baz' } } as IHintConstructor,
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: [
            { hintId: 'bar' } as Problem,
            { hintId: 'bar' } as Problem
        ]
    });

    // First result for another document should be tracked.
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'bar' } } as IHintConstructor,
            { meta: { id: 'baz' } } as IHintConstructor,
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: [
            { hintId: 'foo' } as Problem
        ]
    });

    analytics.trackSave('test.html');

    // Verify multiple saves only submit once with no new results.
    analytics.trackSave('test.html');

    t.true(trackEventSpy.calledTwice);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.firstCall.args[1], {
        'hint-bar': 'failed',
        'hint-baz': 'passed',
        'hint-foo': 'failed'
    });
    t.is(trackEventSpy.secondCall.args[0], 'vscode-save');
    t.deepEqual(trackEventSpy.secondCall.args[1], {
        'hint-bar': 'fixed',
        'hint-baz': 'passed',
        'hint-foo': 'fixing'
    });
});

test('It tracks results again for a document when re-opened', (t) => {
    const { analytics, appInsights } = mock();
    const trackEventSpy = sinon.spy(appInsights, 'trackEvent');

    // First result should be tracked.
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: [
            {
                hintId: 'foo',
                message: 'This should not be logged'
            } as Problem
        ]
    });

    // Closing the document should clear the internal result cache.
    analytics.trackClose('test.html');

    // Second result should be tracked because document was re-opened.
    analytics.trackResult('test.html', {
        hints: [
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: []
    });

    t.true(trackEventSpy.calledTwice);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.firstCall.args[1], { 'hint-foo': 'failed' });
    t.is(trackEventSpy.secondCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.secondCall.args[1], { 'hint-foo': 'passed' });
});
