/* eslint-disable */
import { Entry } from 'har-format';

declare global {

    namespace chrome.devtools.network {
        // Extend `Request` definition to include members from the `HAR` specification.
        export interface Request extends Entry {}
    }

    namespace chrome.devtools.panels {
        /**
         * Fired when the devtools theme changes (Firefox only).
         * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.panels/onThemeChanged
         */
        export var onThemeChanged: {
            addListener(callback: (themeName: typeof chrome.devtools.panels.themeName) => void): void;
            removeListener(callback: (themeName: typeof chrome.devtools.panels.themeName) => void): void;
        };
    }

    namespace chrome.webRequest {

        interface StreamFilter {
            disconnect(): void;
            ondata: (event: { data: ArrayBuffer }) => void;
            onstop: () => void;
            write(data: ArrayBuffer): void;
        }

        export function filterResponseData(requestId: string): StreamFilter;
    }
}
