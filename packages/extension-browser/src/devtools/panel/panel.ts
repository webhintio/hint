import browser from '../../shared/browser';
import { ContentEvents } from '../../shared/types';

const tabId = browser.devtools.inspectedWindow.tabId;
const port = browser.runtime.connect({ name: `${tabId}` });
const results = document.getElementById('results')!;
const toggle = document.getElementById('toggle')!;

const onStart = () => {
    results.textContent = '';
    toggle.textContent = 'Stop';
};

const onStop = () => {
    toggle.textContent = 'Start';
};

const sendMessage = (message: ContentEvents) => {
    browser.runtime.sendMessage(message);
};

port.onMessage.addListener((message: ContentEvents) => {
    if (message.results) {
        results.textContent = JSON.stringify(message.results, null, 4);
        onStop();
    }
});

toggle.addEventListener('click', () => {
    if (toggle.textContent === 'Start') {
        sendMessage({ enable: true, tabId });
        onStart();
    } else {
        sendMessage({ done: true, tabId });
        onStop();
    }
});
