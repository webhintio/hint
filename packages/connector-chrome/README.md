# Chrome (`@hint/connector-chrome`)

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

* `ignoreHTTPSError (boolean)`: Indicates if errors with certificates
  should be ignored. Use this when checking self-signed certificates.
  It is `false` by default.
* `launcherOptions (object)`: Allows you to pass in additional Chrome
  command line API flags. This connector uses
  [Chrome Launcher][chrome-launcher] to start Chrome and
  `launcherOptions` will be relied to it so the same options are
  supported.
* `waitFor (number)`: time in milliseconds the connector will wait after
  the site is ready before starting the DOM traversing and stop listening
  to any network request. By default, it will wait until the network is
  somehow "quiet" even though more requests could be processed after DOM
  traversing. Default is `5000`.

```json
{
    "connector": {
        "name": "chrome",
        "options": {
            "ignoreHTTPSErrors": false,
            "launcherOptions": {
                "defaultProfile": true,
                "flags": ["--headless", "--disable-gpu"]
            },
            "waitFor": 10000
        }
    },
    ...
}
```

## Further Reading

* [Connectors overview][connectors]

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[chrome-launcher]: https://github.com/googlechrome/chrome-launcher
[chrome-launcher-issue]: https://github.com/GoogleChrome/chrome-launcher/issues/118
[cli flags]: https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md
[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
