import { JSDOM } from 'jsdom';
import { SinonSandbox } from 'sinon';

import * as globals from '../../src/shared/globals';

export type Globals = typeof globals;

/**
 * Wait for a listener for the specified event to be registered.
 * Returns a `Promise` that resolves with the registered listener.
 *
 * Note: This must be called *before* loading the background script
 * because listeners are registered during initialization.
 *
 * Note: The returned `Promise` must NOT be `await`ed until *after*
 * loading the background script otherwise it won't resolve.
 */
export const awaitListener = <T>(sandbox: SinonSandbox, event: { addListener: (fn: T) => void }): Promise<T> => new Promise((resolve) => {
    sandbox.stub(event, 'addListener').get(() => (fn: T) => {
        resolve(fn);
    });
});

/**
 * Create and return a newly stubbed `chrome.events.Event` registration type.
 * Gives each `chrome.events.Event` it's own set of registration stubs so
 * event registrations can be individually watched by tests.
 */
export const stubEvent = (): chrome.events.Event<() => void> => ({
    addListener: () => {},
    removeListener: () => {}
} as any);

/**
 * Create and return a newly stubbed global `browser` and `fetch` instances.
 * Gives each test it's own set of stubs for parallel execution.
 */
export const stubGlobals = (dom?: JSDOM): Globals => ({
    browser: {
        browserAction: { onClicked: stubEvent() },
        runtime: {
            onConnect: stubEvent(),
            onMessage: stubEvent(),
            sendMessage: () => {}
        },
        tabs: {
            executeScript: () => {},
            reload: () => {},
            sendMessage: () => {}
        },
        webNavigation: { onCommitted: stubEvent() }
    },
    document: dom ? dom.window.document : null,
    eval: dom ? dom.window.eval : null,
    fetch: () => {},
    location: dom ? dom.window.location : null,
    window: dom ? dom.window : null
} as any);
