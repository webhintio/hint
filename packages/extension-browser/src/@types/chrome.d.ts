/* eslint-disable */
import { Entry } from 'har-format';

declare global {

    namespace chrome.devtools.network {
        // Extend `Request` definition to include members from the `HAR` specification.
        export interface Request extends Entry {}
    }

    namespace chrome.devtools.panels {
        /** The name of the color theme set in user's DevTools settings. */
        export var themeName: 'default' | 'dark';
    }
}
