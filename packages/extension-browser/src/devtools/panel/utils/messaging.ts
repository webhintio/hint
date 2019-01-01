import { browser } from '../../../shared/globals';
import { Events } from '../../../shared/types';

/** Cache the ID of the tab being inspected. */
const tabId = browser.devtools.inspectedWindow.tabId;

/** Create a port for receiving messages from the background script. */
const port = browser.runtime.connect({ name: `${tabId}` });

/** Dispatch a message to the background script. */
export const sendMessage = (message: Events) => {
    message.tabId = tabId;
    browser.runtime.sendMessage(message);
};

/** Register to receive messages from the background script. */
export const addMessageListener = (callback: (message: Events) => void) => {
    port.onMessage.addListener(callback);
};

/** Stop receiving messages from the background script. */
export const removeMessageListener = (callback: (message: Events) => void) => {
    port.onMessage.removeListener(callback);
};
