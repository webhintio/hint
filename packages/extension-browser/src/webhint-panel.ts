import browser from './util/browser';

const toggle = document.querySelector('button#toggle')!;

toggle.addEventListener('click', () => {
    if (toggle.textContent === 'Start') {

        toggle.textContent = 'Stop';

        browser.runtime.sendMessage({ // eslint-ignore-line
            start: { tabId: browser.devtools.inspectedWindow.tabId }
        });

    } else {

        toggle.textContent = 'Start';

        browser.runtime.sendMessage({ // eslint-ignore-line
            stop: { tabId: browser.devtools.inspectedWindow.tabId }
        });

    }
});
