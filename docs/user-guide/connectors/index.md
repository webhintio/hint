# Connectors

The current supported connectors are:

* `jsdom`: Your website will be loaded using [`jsdom`][jsdom].
* `chrome`: Your website will be loaded using Chrome and the Chrome
  Debugging Protocol.

## chrome

The `chrome` connector uses the [Chrome Debugging Protocol][cdp] to
communicate with the browser.

### chrome configuration

The following properties can be customized in your `.sonarrc` file, under the
`options` property of the `connector`:

* `waitFor` time in milliseconds the connector will wait after the site is
  ready before starting the DOM traversing. The default value is `5000`
  milliseconds.

The following is the default configuration:

```json
{
    "connector": {
        "name": "chrome",
        "options": {
            "waitFor": 5000
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
