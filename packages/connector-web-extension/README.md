# Web extension connector (`@hint/connector-web-extension`)

A web extension connector to analyze a page running in a browser
with `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-web-extension
```

## Known issues

* This connector can't traverse an HTML file.

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {
        "name": "web-extension"
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
