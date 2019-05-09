# Connectors

A `connector` is the interface between the `hint`s and the website
you are testing. It is responsible for loading the website and exposing
all the information to `webhint` such as resources, network data, etc.

To configure a connector you need to update your `.hintrc` file to
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
that you specify in the`.hintrc` file, you will need to have the
browser the `connector` is for installed as `webhint` will not
install it for you.

The current supported connectors are:

* `jsdom`: Your website will be loaded using [`jsdom`][jsdom].
* `chrome`: Your website will be loaded using Chrome and the Chrome
  Debugging Protocol.
* `local`: This connector will analyze the files specified (a file
  or a directory).

**Note:** If you are running Windows 10 [build 14951][wsl-interop] (or
later) and Windows Subsystem for Linux (WSL), `webhint` will be capable
of running the browsers installed directly on Windows. If you are a
user of the stable release of Window, you will need to use at least the
*Fall Creators Update*.

## Configuration

`connector`s can be configured. Maybe you want to do a request with
another `userAgent`, change some of the other defaults, etc. For that,
you have to add the property `options` to your `connector` property
with the values you want to modify:

```json
"connector": {
    "name": "connectorName",
    "options": {}
}
```

The following is the list of shared configurations for all `connector`s:

* `ignoreHTTPSErrors` is a boolean that indicates if errors with certificates
  should be ignored. Use this when checking self-signed certificated.

* `waitFor` time in milliseconds the connector will wait after the site is
  ready before starting the DOM traversing and stop listening to any
  network request. By default, it will wait until the network is somehow
  "quiet" even though more requests could be processed after DOM traversing.

Depending on the `connector`, other configurations may be available.

### jsdom configuration

`jsdom` is built on top of [`request`][request]. The way to configure
it is via the `requestOptions` property. The following is an example
on how to use custom headers:

```json
 {
    "name": "jsdom",
    "waitFor": 10000,
    "requestOptions": {
        "headers": {
            "Accept-Language": "en-US,en;q=0.8,es;q=0.6,fr;q=0.4",
            "Cache-Control": "no-cache",
            "DNT": 1,
            "Pragma": "no-cache",
            "User-Agent": "Custom user agent"
        }
    }
}
```

### chrome configuration

The `chrome-connector` uses [`chrome-launcher`][chrome-launcher] to
start the browser. The way to pass custom options is via the
`launcherOptions` property. The following is an example that passes
some `flags` to it and uses the `defaultProfile`:

```json
 {
    "name": "chrome",
    "waitFor": 10000,
    "launcherOptions": {
        "defaultProfile": true,
        "flags": ["--headless", "--disable-gpu"],
    }
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
engine.executeOn(url, {content: '{{your content}}'});
```

## Differences among connectors

Connectors are expected to implement at least some basic functionality
(see [how to develop a connector][how to connector])
but expose more events or have some extra functionality. The following
document details the known differences or issues among the official
connectors.

### jsdom

* It will not send the events for:

  * `element::#document`
  * `element::#comment`

<!-- Link labels: -->

[how to connector]: ../../contributor-guide/how-to/connector.md
[jsdom]: https://github.com/tmpvar/jsdom
[request]: https://github.com/request/request
[chrome-launcher]: https://github.com/googlechrome/chrome-launcher
[wsl-interop]: https://msdn.microsoft.com/en-us/commandline/wsl/release_notes#build-14951
