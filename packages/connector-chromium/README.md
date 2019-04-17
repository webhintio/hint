# Chromium (`@hint/connector-chromium`)

A connector to use Chromium based browsers via
[puppeteer][puppeteer] in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-chromium
```

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {
        "name": "chromium"
    },
    ...
}
```

## Options

The set of settings supported by the Chromim connector are:

```json
{
    "connector": {
        "name": "chromium",
        "options": {
            "tbd": "tbd"
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
