# Chrome connector (`@sonarwhal/connector-chrome`)

A connector to use Google Chrome via the [chrome debugging
protocol][cdp] in `sonarwhal`.

## Installation

First, you need to install [`sonarwhal`](https://sonarwhal.com/):

```bash
npm install sonarwhal
```

Then, install the new connector:

```bash
npm install @sonarwhal/connector-chrome
```

## Usage

Configure the connector name in your [`.sonarwhalrc`][sonarwhalrc]
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
  want `sonarwhal` to have access to pages where the default profile is
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
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[connectors]: https://sonarwhal.com/docs/user-guide/concepts/connectors/
