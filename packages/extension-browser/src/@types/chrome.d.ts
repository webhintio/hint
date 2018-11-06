/* eslint-disable */
import { Entry } from 'har-format';

declare global {
    namespace chrome.devtools.network {
        // Extend `Request` definition to include members from the `HAR` specification.
        export interface Request extends Entry {}
    }
}
