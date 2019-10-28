# jsdom (`@hint/connector-jsdom`)

A connector to use [jsdom][jsdom] in `webhint`.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {
        "name": "jsdom"
    },
    ...
}
```

## Options

The set of settings supported by jsdom connector are:

* `ignoreHTTPSError (boolean)`: Indicates if errors with certificates
  should be ignored. Use this when checking self-signed certificates.
  It is `false` by default.
* `waitFor (number)`: time in milliseconds the connector will wait after
  the site is ready before starting the DOM traversing and stop listening
  to any network request. By default, it will wait until the network is
  somehow "quiet" even though more requests could be processed after DOM
  traversing. Default is `5000`.

```json
{
    "connector": {
        "name": "jsdom",
        "options": {
            "ignoreHTTPSErrors": false,
            "waitFor": 10000
        }
    },
    ...
}
```

## Further Reading

* [Connectors overview][connectors]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[jsdom]: https://github.com/jsdom/jsdom
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
