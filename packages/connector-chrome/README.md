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
  already authenticated.
* `useTabUrl (boolean)`: Indicates if the browser should navigate first
  to a given page before going to the final target. `false` by default.
* `tabUrl (string)`: The URL to visit before the final target in case
  `useTabUrl` is `true`. `https://empty.sonarwhal.com/` is the
  default value.

```json
{
    "connector": {
        "name": "chrome",
        "options": {
            "defaultProfile": true,
            "useTabUrl": false,
            "tabUrl": "https://empty.sonarwhal.com/"
        }
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
