# Connectors

The current supported connectors are:

* `jsdom`: Your website will be loaded using [`jsdom`][jsdom].
* `chrome`: Your website will be loaded using Chrome and the Chrome
  Debugging Protocol. This is one of the `remote-debugging-connector`s

## Configuration

The following properties can be customized in your `.sonarrc` file,
under the `options` property of the `connector` for any of the
officially supported ones:

* `waitFor` time in milliseconds the connector will wait after the site is
  ready before starting the DOM traversing. The default value is `1000`
  milliseconds.

The following is the default configuration:

```json
{
    "connector": {
        "name": "chrome|jsdom",
        "options": {
            "waitFor": 1000
        }
    }
}
```

### jsdom configuration

`jsdom` allows you to configure the following:

* `headers`: the headers used to fetch the resources. By default they are:

```json
 {
    "Accept-Language": "en-US,en;q=0.8,es;q=0.6,fr;q=0.4",
    "Cache-Control": "no-cache",
    "DNT": 1,
    "Pragma": "no-cache",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.2924.87 Safari/537.36"
}
```

### remote-debugging-connector configuration

There are some `connector`s built on top of the [chrome debugging
protocol][cdp]. `chrome` is one of these `connector`s.

The set of settings specific for them are:

* `useTabUrl`: Indicates if the browser should navigate first to a
  given page before going to the final target. `false` by default.
* `tabUrl`: The URL to visit before the final target in case
  `useTabUrl` is `true`. `https://empty.sonarwhal.com/` is the
  default value.

```json
{
    "tabUrl": "https://empty.sonarwhal.com/",
    "useTabUrl": false
}
```

## Differences among connectors

Connectors are expected to implement at least some basic functionality
(see [how to develop a connector](../../contributor-guide/connectors/index.md))
but expose more events or have some extra functionality. The following
document details the known differences among the official connectors.

### jsdom

* It will not send the events for:

  * `element::#document`
  * `element::#comment`

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[jsdom]: https://github.com/tmpvar/jsdom
