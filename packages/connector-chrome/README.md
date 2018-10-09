# Chrome connector (`@hint/connector-chrome`)

A connector to use Google Chrome via the [chrome debugging
protocol][cdp] in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-chrome
```

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {
        "name": "chrome"
    },
    ...
}
```

## Options

The set of settings supported by Chrome connector are:

* `defaultProfile (boolean)`: Indicates if the browser should use the
  default profile or create a new one. By default the value is `false`
  so a new one is created. You might want to set it to `true` if you
  want `webhint` to have access to pages where the default profile is
  already authenticated. NOTE: Due to an issue in
  [`chrome-launcher`][chrome-launcher-issue], all the instances of
  the browser need to be closed before run `webhint`.
* `useTabUrl (boolean)`: Indicates if the browser should navigate first
  to a given page before going to the final target. `false` by default.
* `tabUrl (string)`: The URL to visit before the final target in case
  `useTabUrl` is `true`. `https://empty.webhint.io/` is the
  default value.
* `flags? (Array<string>)`: Allows you to pass in additional Chrome
  command line API flags. Useful if you would like to start your
  session in headless mode or with GPU disabled. Here's the full list
  of [available command line flags][cli flags].
  `['--no-default-browser-check']` is the default value.
* `waitForContentLoaded (number)`: Time the browser has to wait for the
  event `loadingFinished` before use the body received in the event
  `responseReceived`. `10000` (10 seconds) is the default value.

```json
{
    "connector": {
        "name": "chrome",
        "options": {
            "defaultProfile": true,
            "useTabUrl": false,
            "tabUrl": "https://empty.webhint.io/",
            "flags": ["--headless", "--disable-gpu"],
            "waitForContentLoaded": 10000
        }
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[cli flags]: https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md
[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[chrome-launcher-issue]: https://github.com/GoogleChrome/chrome-launcher/issues/118