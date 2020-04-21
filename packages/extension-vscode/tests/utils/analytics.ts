import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { Problem } from '@hint/utils-types';
import { IHintConstructor } from 'hint';

const stubContext = () => {
    let _enabled = false;
    const config = {
        get: () => {},
        set: () => {}
    };
    const stubs = {
        '@hint/utils-telemetry': {
            enabled() {
                return _enabled;
            },
            initTelemetry(opts) {
                _enabled = opts.enabled || false;
            },
            updateTelemetry(enabled) {
                _enabled = enabled;
            }
        } as typeof import('@hint/utils-telemetry'),
        configstore: class {
            public constructor() {
                return config;
            }
        }
    };
    const module = proxyquire('../../src/utils/analytics', stubs) as typeof import('../../src/utils/analytics');

    return { config, module, stubs };
};

test('It tracks when telemetry is first enabled', (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const trackEventSpy = sandbox.spy(stubs['@hint/utils-telemetry'], 'trackEvent');

    module.trackOptIn('ask', true);
    t.true(trackEventSpy.notCalled);

    module.trackOptIn('ask', false);
    t.true(trackEventSpy.notCalled);

    module.trackOptIn('disabled', true);
    t.true(trackEventSpy.notCalled);

    module.trackOptIn('disabled', false);
    t.true(trackEventSpy.notCalled);

    module.trackOptIn('enabled', true);
    t.true(trackEventSpy.notCalled);

    module.trackOptIn('enabled', false);
    t.true(trackEventSpy.calledOnce);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-telemetry');

    sandbox.restore();
});

test('It tracks the first result for each document when opened', (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const trackEventSpy = sandbox.spy(stubs['@hint/utils-telemetry'], 'trackEvent');

    // First result should be tracked.
    module.trackResult('test.html', 'html', {
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
    module.trackResult('test.html', 'html', {
        hints: [
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: []
    });

    // First result for another document should be tracked.
    module.trackResult('test.css', 'css', {
        hints: [
            { meta: { id: 'bar' } } as IHintConstructor
        ],
        problems: []
    });

    t.true(trackEventSpy.calledTwice);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.firstCall.args[1], {
        'hint-foo': 'failed',
        languageId: 'html'
    });
    t.is(trackEventSpy.secondCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.secondCall.args[1], {
        'hint-bar': 'passed',
        languageId: 'css'
    });

    sandbox.restore();
});

test('It tracks the delta between the first and last results on save', (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const trackEventSpy = sandbox.spy(stubs['@hint/utils-telemetry'], 'trackEvent');

    // First result should be tracked.
    module.trackResult('test.html', 'html', {
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
    module.trackResult('test.html', 'html', {
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
    module.trackResult('test.html', 'html', {
        hints: [
            { meta: { id: 'bar' } } as IHintConstructor,
            { meta: { id: 'baz' } } as IHintConstructor,
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: [
            { hintId: 'foo' } as Problem
        ]
    });

    module.trackSave('test.html', 'html');

    // Verify multiple saves only submit once with no new results.
    module.trackSave('test.html', 'html');

    t.true(trackEventSpy.calledTwice);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.firstCall.args[1], {
        'hint-bar': 'failed',
        'hint-baz': 'passed',
        'hint-foo': 'failed',
        languageId: 'html'
    });
    t.is(trackEventSpy.secondCall.args[0], 'vscode-save');
    t.deepEqual(trackEventSpy.secondCall.args[1], {
        'hint-bar': 'fixed',
        'hint-baz': 'passed',
        'hint-foo': 'fixing',
        languageId: 'html'
    });

    sandbox.restore();
});

test('It tracks results again for a document when re-opened', (t) => {
    const sandbox = sinon.createSandbox();
    const { module, stubs } = stubContext();
    const trackEventSpy = sandbox.spy(stubs['@hint/utils-telemetry'], 'trackEvent');

    // First result should be tracked.
    module.trackResult('test.html', 'html', {
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
    module.trackClose('test.html');

    // Second result should be tracked because document was re-opened.
    module.trackResult('test.html', 'html', {
        hints: [
            { meta: { id: 'foo' } } as IHintConstructor
        ],
        problems: []
    });

    t.true(trackEventSpy.calledTwice);
    t.is(trackEventSpy.firstCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.firstCall.args[1], {
        'hint-foo': 'failed',
        languageId: 'html'
    });
    t.is(trackEventSpy.secondCall.args[0], 'vscode-open');
    t.deepEqual(trackEventSpy.secondCall.args[1], {
        'hint-foo': 'passed',
        languageId: 'html'
    });
});
