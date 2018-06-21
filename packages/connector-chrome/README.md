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
    ...
    "connector": {
        "name": "connector-chrome"
    },
    ...
}
```

## Options

The set of settings supported by chrome connector are:

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
    ...
    "connector": {
        "name": "connector-edge",
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

## Code of Conduct

This project adheres to the [JS Foundation's code of
conduct](https://js.foundation/community/code-of-conduct).

By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).

<!-- Link labels: -->

[cdp]: https://chromedevtools.github.io/devtools-protocol/
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[connectors]: https://sonarwhal.com/docs/user-guide/concepts/connectors/
