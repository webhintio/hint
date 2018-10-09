# Connectors

A `connector` is the interface between the `rule`s and the website
you are testing. It is responsible for loading the website and exposing
all the information to `sonarwhal` such as resources, network data, etc.

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
Linux, macOS, and Windows. The only caveat is that, for the `connector`
that you specify in the`.sonarwhalrc` file, you will need to have the
browser the `connector` is for installed as `sonarwhal` will not
install it for you.

The current supported connectors are:

* `jsdom`: Your website will be loaded using [`jsdom`][jsdom].
* `chrome`: Your website will be loaded using Chrome and the Chrome
  Debugging Protocol. This is one of the `remote-debugging-connector`s
* `edge`: Your website will be loaded using Edge via the
  [`edge-diagnostics-adapter`][eda]. You will need to run Windows 10
  Creators Update or later to use it. This connector will only be
  installed if you are running on it. There are some known issues so
  please check the [Edge issues](#edge-issues) section below.
* `local`: This connector will analyze the files specified (a file
  or a directory). This connector will use [`jsdom`][jsdom] to
  read and analyze html file.

**Note:** If you are running Windows 10 [build 14951][wsl-interop] (or
later) and Windows Subsystem for Linux (WSL), `sonarwhal` will be capable
of running the browsers installed directly on Windows. If you are a
user of the stable release of Window, you will need to use at least the
*Fall Creators Update*.

## Configuration

`connector`s can be configured. Maybe you want to do a request with
another `userAgent`, change some of the other defaults, etc. For that,
you just have to add the property `options` to your `connector` property
with the values you want to modify:

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

Depending on the `connector`, other configurations may be available.

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

<!-- markdownlint-disable MD033 -->

### remote-debugging-connector configuration <a name="rdc-config"></a>

<!-- markdownlint-enable MD033 -->

There are some `connector`s built on top of the [Chrome DevTools
Protocol][cdp]. `chrome` and `edge` are some of these `connector`s.

The set of settings specific for them are:

* `defaultProfile (boolean)`: Indicates if the browser should use the
  default profile or create a new one. By default the value is `false`
  so a new one is created. You might want to set it to `true` if you
  want `sonarwhal` to have access to pages where the default profile is
  already authenticated. This only applies for Google Chrome as
  Microsoft Edge doesn’t create a new profile.
* `useTabUrl (boolean)`: Indicates if the browser should navigate first
  to a given page before going to the final target. `false` by default.
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

### local configuration

`local` allows you to configure the following:

* `pattern`: Add or ignore files defined in the pattern. By default the
  `local` connector will use the following patter `['**', '!.git/**']`. This
  doesn't apply if you are targeting just a file or if you are using the
  options `content`.
* `watch`: Run `webhint` in watch mode. Watch files and trigger the analysis
  on changes.

```json
{
  "pattern": ["**", "!.git/**"],
  "watch": false
}
```

In addition, the `local` connector accept a new parameter in the
method `collect` that allow you to pass the content to analyze as an string.
To use that property, you need to call to the `executeOn` method in
the engine with the content to analyze.

```js
  engine.executeOn(url, {content: '{{your content}}'})
```

## Differences among connectors

Connectors are expected to implement at least some basic functionality
(see [how to develop a connector](../../contributor-guide/connectors/index.md))
but expose more events or have some extra functionality. The following
document details the known differences or issues among the official
connectors.

<!-- markdownlint-disable MD033 -->

### Edge<a name="edge-issues"></a>

<!-- markdownlint-enable MD033 -->

* You need administrator privileges to run `sonarwhal` on Edge. You
  should be automatically prompted when running it.
* It’s best to close all instances of Edge before to avoid any issues.
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
[wsl-interop]: https://msdn.microsoft.com/en-us/commandline/wsl/release_notes#build-14951
