# Connectors

The current supported connectors are:

* `jsdom`: Your website will be loaded using [`jsdom`][jsdom].
* `cdp`: Your website will be loaded using Chrome and the Chrome
  Debugging Protocol.

## CDP

The `CDP` connector uses the [Chrome Debugging Protocol][cdp] to
communicate with the browser.

### CDP configuration

The following properties can be customized in your `.sonarrc` file, under the
`options` property of the `connector`:

* `maxLoadWaitTime` the max time in milliseconds the connector will wait for
  the website to be ready before continuing. The default value is `30000`
  milliseconds.
* `loadCompleteRetryInterval` time in milliseconds the connector will wait
  before checking again if the website is ready (all the resources are loaded
  and no pending network requests). The default value is `500` milliseconds.
  The maximum number of retries is defined by
  `maxLoadWaitTime/loadCompleteRetryInterval`.
  E.g.: `loadCompleteRetryInterval = 10000` and `maxLoadWaitTime = 30000` means
  that at most there will be 3 retries () to check if everything is loaded
  before continuing the execution.
* `waitFor` time in milliseconds the connector will wait after the site is
  ready before starting the DOM traversing. The default value is `5000`
  milliseconds.

The following is the default configuration:

```json
{
    "connector": {
        "name": "cdp",
        "options": {
            "waitFor": 5000,
            "loadCompleteRetryInterval": 500,
            "maxLoadWaitTime": 30000
        }
    }
}
```

## Differences among connectors

Connectors are expected to implement at least some basic functionality
(see [how to develop a connector](../../developer-guide/connectors/index.md))
but expose more events or have some extra functionality. The following
document details the known differences among the official connectors.

### JSDOM

* It will not send the events for:

  * `element::#document`
  * `element::#comment`

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[jsdom]: https://github.com/tmpvar/jsdom
