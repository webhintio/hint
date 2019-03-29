/* eslint-disable */
import { Entry } from 'har-format';

declare global {

    namespace chrome.devtools.network {
        // Extend `Request` definition to include members from the `HAR` specification.
        export interface Request extends Entry {}
    }

    namespace chrome.devtools.panels {
        /** The name of the color theme set in user's DevTools settings. */
        export var themeName: string;

        /**
         * Fired when the devtools theme changes (Firefox only).
         * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.panels/onThemeChanged
         */
        export var onThemeChanged: {
            addListener(callback: (themeName: string) => void): void;
            removeListener(callback: (themeName: string) => void): void;
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
