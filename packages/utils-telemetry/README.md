# Utils telemetry (`@hint/utils-telemetry`)

A collection of utilities to help consistently gather telemetry across
webhint clients.

## API

### `determineHintStatus`

Extract pass/fail/fixing/fixed status for each hint from scan results.
A hint is considered 'fixed' when passing after failing the previous scan.
The 'fixing' status is when the number of failures decreases between scans.

To avoid false-positives for the 'fixing' and 'fixed' statuses, callers
should ensure the previous scan occurs on the same URL with the same
configuration.

```js
import { determineHintStatus } from '@hint/utils-telemetry';

/*
 * status['hint-compat-api/css'] === 'passed'
 * status['hint-compat-api/html'] === 'failed'
 */
const prev = {};
const next = { 'compat-api/css': 0, 'compat-api/html': 1 };
const status = determineHintStatus(prev, next);

/*
 * status['hint-compat-api/css'] === 'passed'
 * status['hint-compat-api/html'] === 'fixing'
 */
const prev = { 'compat-api/css': 0, 'compat-api/html': 2 };
const next = { 'compat-api/css': 0, 'compat-api/html': 1 };
const status = determineHintStatus(prev, next);

/*
 * status['hint-compat-api/css'] === 'passed'
 * status['hint-compat-api/html'] === 'fixed'
 */
const prev = { 'compat-api/css': 0, 'compat-api/html': 1 };
const next = { 'compat-api/css': 0, 'compat-api/html': 0 };
const status = determineHintStatus(prev, next);

```

### `getUpdatedActivity`

Retrieve an updated activity log if and only if it has not already
been updated in the current UTC day.

```js
import { getUpdatedActivity } from '@hint/utils-telemetry';

/*
 * Omitting previous activity returns a fresh entry for today:
 * {
 *   last28Days: '1000000000000000000000000000',
 *   lastUpdated: '2019-11-08T00:00:00.000Z'
 * }
 */
console.log(getUpdatedActivity());

// Calling on the same day as previous activity returns `null`.
getUpdatedActivity({
    last28Days: '1000000000000000000000000000',
    lastUpdated: '2019-11-08T00:00:00.000Z'
});

/*
 * Calling on a different day than previous activity fills in the gaps:
 * {
 *   last28Days: '1010000000000000000000000000',
 *   lastUpdated: '2019-11-08T00:00:00.000Z'
 * }
 */
getUpdatedActivity({
    last28Days: '1000000000000000000000000000',
    lastUpdated: '2019-11-06T00:00:00.000Z'
});
```

### `enabled`

Check if telemetry is currently enabled.

```js
enabled(); // true / false
```

### `initTelemetry`

Initialize telemetry with the provided options

```js
initTelemetry({

    // How long to gather events before submitting.
    batchDelay: 15000,

    // Any default properties to include with every event (e.g. 'extension-version').
    defaultProperties: {} as Properties,

    // Whether telemetry is initially enabled.
    enabled: false,

    // The instrumentation key to use with Application Insights.
    instrumentationKey: '',

    // The method to use to post telemetry to Application Insights (must be overridden).
    post: (url: string, data: string) => {
        return Promise.resolve(200);
    }

});
```

### `trackEvent`

Log a named custom event to Application Insights (if telemetry is enabled).

```js
trackEvent('vscode-save', determineHintStatus(prevResults, results));
```

### `updateTelemetry`

Enable or disable telemetry.

```js
updateTelemetry(true); // Enabled
updateTelemetry(false); // Disabled
```
