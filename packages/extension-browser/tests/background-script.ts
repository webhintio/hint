import test from 'ava';

import * as proxyquire from 'proxyquire';
import { createSandbox, SinonSandbox } from 'sinon';

import { FetchEnd, FetchStart } from 'hint/dist/src/lib/types/events';
import { Config, Events, Results } from '../src/shared/types';

import { awaitListener, stubEvent, stubGlobals, Globals } from './helpers/globals';

const backgroundScriptPath = '../src/background-script';
const contentScriptPath = 'content-script/webhint.js';

/**
 * Require the background script using the provided `browser` APIs.
 */
const loadBackgroundScript = (globals: Globals) => {
    proxyquire(backgroundScriptPath, {
        './shared/globals': {
            '@noCallThru': true,
            ...globals
        }
    });
};

/**
 * Returns a method which can be invoked to trigger content script injection.
 * Returned method accepts an argument specifying the `tabId` to inject to.
 *
 * Note: Must be called to get the method *before* loading the background script.
 *
 * Note: Returned method must be called *after* loading the background script.
 */
const prepareContentScriptInjection = (sandbox: SinonSandbox, browser: typeof chrome) => {
    const onCommittedPromise = awaitListener(sandbox, browser.webNavigation.onCommitted);
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    return async (tabId: number): Promise<void> => {

        const onMessage = await onMessagePromise;

        // Simulate receiving `Events.enable` from the devtools panel.
        onMessage({ enable: { config: {} } } as Events, { tab: { id: tabId } } as any, () => {});

        const onCommitted = await onCommittedPromise;

        // Simulate receiving `browser.webNavigation.onCommitted` to trigger content script injection.
        onCommitted({ frameId: 0, tabId } as any);
    };
};

test('It registers for messages.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;

    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const onMessage = await onMessagePromise;

    t.true(typeof onMessage === 'function', 'Background script did not provide a listener');

    sandbox.restore();
});

test('It reloads the target when enabled.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 5;

    const reloadSpy = sandbox.spy(browser.tabs, 'reload');
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const onMessage = await onMessagePromise;

    // Simulate receiving `Events.enable` from the devtools panel.
    onMessage({ enable: {} }, { tab: { id: tabId } } as any, () => {});

    t.true(reloadSpy.calledOnce);
    t.is(reloadSpy.firstCall.args[0] as any, tabId);
    t.true((reloadSpy.firstCall.args as any)[1].bypassCache);

    sandbox.restore();
});

test('It injects the content script when enabled.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 7;

    const executeScriptSpy = sandbox.spy(browser.tabs, 'executeScript');
    const injectContentScript = prepareContentScriptInjection(sandbox, browser);

    loadBackgroundScript(globals);

    await injectContentScript(tabId);

    t.true(executeScriptSpy.calledOnce);
    t.is(executeScriptSpy.firstCall.args[0], tabId);
    t.is(executeScriptSpy.firstCall.args[1].file, contentScriptPath);
    t.is(executeScriptSpy.firstCall.args[1].runAt, 'document_start');

    sandbox.restore();
});

test('It retries injecting the content script if it fails.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 7;

    let first = true;

    browser.tabs.executeScript = ((tabId: number, details: chrome.tabs.InjectDetails, callback?: (result: any[]) => void) => {
        setTimeout(() => {
            if (first) {
                first = false;
                callback!([]); // Callback with empty array on first try to simulate failure.
            } else {
                callback!([{}]); // Callback with array containing an object to simulate success.
            }
        }, 0);
    }) as any;

    const executeScriptSpy = sandbox.spy(browser.tabs, 'executeScript');
    const injectContentScript = prepareContentScriptInjection(sandbox, browser);

    loadBackgroundScript(globals);

    await injectContentScript(tabId);

    t.true(executeScriptSpy.calledOnce);
    t.is(executeScriptSpy.firstCall.args[0], tabId);
    t.is(executeScriptSpy.firstCall.args[1].file, contentScriptPath);
    t.is(executeScriptSpy.firstCall.args[1].runAt, 'document_start');

    sandbox.restore();
});

test('It passes provided configuration to the content script.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 7;
    const config: Config = {
        browserslist: 'default',
        disabledCategories: ['accessibility'],
        ignoredUrls: 'google-analytics.com'
    };

    const sendMessageSpy = sandbox.spy(browser.tabs, 'sendMessage');
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const onMessage = await onMessagePromise;

    // Simulate receiving `Events.enable` from the devtools panel.
    onMessage({ enable: { config }, tabId } as Events, {} as any, () => {});

    // Simulate receiving `Events.requestConfig` from the content script.
    onMessage({ requestConfig: true}, { tab: { id: tabId } } as any, () => {});

    t.true(sendMessageSpy.calledOnce);
    t.is(sendMessageSpy.firstCall.args[0], tabId);
    t.is((sendMessageSpy.firstCall.args[1] as any).config, config);

    sandbox.restore();
});

test('It forwards `fetch::*` events from the devtools panel.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 7;
    const fetchStart = {} as FetchStart;
    const fetchEnd = {} as FetchEnd;

    const sendMessageSpy = sandbox.spy(browser.tabs, 'sendMessage');
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const onMessage = await onMessagePromise;

    // Simulate receiving `Events.ready` from the content script to ensure events are NOT queued.
    onMessage({ ready: true }, { tab: { id: tabId } } as any, () => {});

    // Simulate receiving `Events.fetchStart` from the devtools panel.
    onMessage({ fetchStart, tabId }, {} as any, () => {});

    // Simulate receiving `Events.fetchEnd` from the devtools panel.
    onMessage({ fetchEnd, tabId }, {} as any, () => {});

    t.true(sendMessageSpy.calledTwice);
    t.is(sendMessageSpy.firstCall.args[0], tabId);
    t.is((sendMessageSpy.firstCall.args[1] as any).fetchStart, fetchStart);
    t.is(sendMessageSpy.secondCall.args[0], tabId);
    t.is((sendMessageSpy.secondCall.args[1] as any).fetchEnd, fetchEnd);

    sandbox.restore();
});

test('It sends queued events in response to `ready`.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 9;
    const fetchStart = {} as FetchStart;

    const sendMessageSpy = sandbox.spy(browser.tabs, 'sendMessage');
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const onMessage = await onMessagePromise;

    // Simulate receiving `Events.fetchStart` from the devtools panel.
    onMessage({ fetchStart, tabId }, {} as any, () => {});

    t.true(sendMessageSpy.notCalled, 'Events were not queued');

    // Simulate receiving `Events.ready` to trigger receiving queued events.
    onMessage({ ready: true }, { tab: { id: tabId } } as any, () => {});

    t.true(sendMessageSpy.calledOnce, 'Queued events were not sent');
    t.is(sendMessageSpy.firstCall.args[0], tabId);
    t.is((sendMessageSpy.firstCall.args[1] as any).fetchStart, fetchStart);

    sandbox.restore();
});

test('It forwards results to the devtools panel.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 3;
    const results: Results = { categories: [], url: '' };

    const port: chrome.runtime.Port = {
        name: `${tabId}`,
        onMessage: stubEvent(),
        postMessage: () => {}
    } as any;

    const postMessageSpy = sandbox.spy(port, 'postMessage');

    const onConnectPromise = awaitListener(sandbox, browser.runtime.onConnect);
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const [onConnect, onMessage] = await Promise.all([onConnectPromise, onMessagePromise]);

    // Simulate receiving `runtime.onConnect` from the devtools panel.
    onConnect(port);

    // Simulate receiving `Events.results` from the content script.
    onMessage({ results }, { tab: { id: tabId } } as any, () => {});

    t.true(postMessageSpy.calledOnce);
    t.is((postMessageSpy.firstCall.args[0] as any).results, results);

    sandbox.restore();
});

test('It ignores results without a devtools panel.', async (t) => {
    const sandbox = createSandbox();
    const globals = stubGlobals();
    const { browser } = globals;
    const tabId = 1;
    const results: Results = { categories: [], url: '' };

    const port: chrome.runtime.Port = {
        name: `${tabId + 1}`, // Chose a different tabId so we should NOT receive results.
        onMessage: stubEvent(),
        postMessage: () => {}
    } as any;

    const postMessageSpy = sandbox.spy(port, 'postMessage');

    const onConnectPromise = awaitListener(sandbox, browser.runtime.onConnect);
    const onMessagePromise = awaitListener(sandbox, browser.runtime.onMessage);

    loadBackgroundScript(globals);

    const [onConnect, onMessage] = await Promise.all([onConnectPromise, onMessagePromise]);

    // Simulate receiving `runtime.onConnect` from the devtools panel.
    onConnect(port);

    // Simulate receiving `Events.results` from the content script.
    onMessage({ results }, { tab: { id: tabId } } as any, () => {});

    t.true(postMessageSpy.notCalled);

    sandbox.restore();
});
