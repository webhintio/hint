# jsdom (`@hint/connector-jsdom`)

A connector to use [jsdom][jsdom] in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-jsdom
```

## Known issues

* It will not send the events for:

  * `element::#document`
  * `element::#comment`

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

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
