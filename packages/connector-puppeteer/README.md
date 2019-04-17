# Puppeteer (`@hint/connector-puppeteer`)

A connector that uses [puppeteer][puppeteer]
to communicate with the browsers in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-puppeteer
```

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {
        "name": "puppeteer"
    },
    ...
}
```

## Options

The set of settings supported by the Puppeteer connector are:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "ignoreHTTPSErrors: true|false,
            "waitUntil": "dom|loaded|networkidle0|networkidle2"
        }
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[puppeteer]: https://pptr.dev/
