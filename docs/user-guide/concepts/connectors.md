# Connectors

A `connector` is the interface between the `rule`s and the website
you are testing.

To configure a connector you need to update your `.sonarwhalrc` file to
make it look like the following:

```json
{
    "connector": {
        "name": "connectorName"
    }
}
```

Where `connectorName` is the name of the connector.

## Built-in connectors and platform support

All the built-in `connector`s run in any of the supported platforms:
Linux, macOS, and Windows. The only caveat is that when selecting a
`connector` for a browser (such as `chrome`) in `.sonarwhalrc`, the browser
needs to be on the machine. `sonarwhal` will not install it if it isn’t.

The current supported connectors are:

* `jsdom`: Your website will be loaded using [`jsdom`][jsdom].
* `chrome`: Your website will be loaded using Chrome and the Chrome
  Debugging Protocol. This is one of the `remote-debugging-connector`s
* `edge`: Your website will be loaded using Edge via the [`edge-diagnostics-adapter`][eda].
  You will need to run Windows 10 Creators Update or later to use it.
  There are some known issues so please check the [Edge issues](#edge-issues)
  section below.

**Note:** If you are running Windows 10 [build 14951][wsl-interop] (or
later) and Windows Subsystem for Linux (WSL), `sonarwhal` will be capable
of running the browsers installed directly on Windows. If you are a
user of the stable release of Window, you will need to use at least the
*Fall Creators Update*.

## Configuration

`connector`s can be configured. Maybe you want to do request with
another `userAgent`, change some of the other defaults, etc. To do
that, you just have to add a property `options` to your `connector`
property with the values you want to modify:

```json
"connector": {
    "name": "connectorName",
    "options": {}
}
```

The following is the list of shared configurations for all `connector`s:

* `waitFor` time in milliseconds the connector will wait after the site is
  ready before starting the DOM traversing. The default value is `1000`
  milliseconds.

The default value is `1000`.

Depending on the `connector`, more configuration options are available.

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

There are some `connector`s built on top of the [Chrome DevTools
Protocol][cdp]. `chrome` and `edge` are some of these `connector`s.

The set of settings specific for them are:

* `defaultProfile (boolean)`: Indicates if the browser should use the
  default profile or create a new one. By default the value is `false`
  so a new one is created. You might want to set it to `true` if you
  want `sonarwhal` to have access to pages where the default profile is
  already authenticated. This only applies for Google Chrome as
  Microsoft Edge doesn't create a new profile.
* `useTabUrl (boolean)`: Indicates if the browser should navigate first to a
  given page before going to the final target. `false` by default.
* `tabUrl (string)`: The URL to visit before the final target in case
  `useTabUrl` is `true`. `https://empty.sonarwhal.com/` is the
  default value.

```json
{
    "defaultProfile": true,
    "tabUrl": "https://empty.sonarwhal.com/",
    "useTabUrl": false
}
```

## Differences among connectors

Connectors are expected to implement at least some basic functionality
(see [how to develop a connector](../../contributor-guide/connectors/index.md))
but expose more events or have some extra functionality. The following
document details the known differences among the official connectors.

<!-- markdownlint-disable MD033 -->

### Edge<a name="edge-issues"></a>

<!-- markdownlint-enable MD033 -->

* You need administrator privileges to run `sonarwhal` on Edge. You
  should be automatically prompted when running it.
* It's best to close all instances of Edge before to avoid any issues.
* The current implementation can have some problems when scanning multiple
  sites simultaneously. This should not be a common scenario.
* The connector will make use of the `useTabUrl` and `tabUrl` properties.
  Removing those can cause unexpected results.

### jsdom

* It will not send the events for:

  * `element::#document`
  * `element::#comment`

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[eda]: https://github.com/Microsoft/edge-diagnostics-adapter
[jsdom]: https://github.com/tmpvar/jsdom
