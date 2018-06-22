# Local connector (`@sonarwhal/connector-local`)

A local connector to analyze the files in your project with `sonarwhal`.

## Installation

First, you need to install [`sonarwhal`](https://sonarwhal.com/):

```bash
npm install sonarwhal
```

Then, install the new connector:

```bash
npm install @sonarwhal/connector-local
```

## Known issues

* This connector can't traverse an html file.

## Usage

Configure the connector name in your [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    ...
    "connector": {
        "name": "local"
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[connectors]: https://sonarwhal.com/docs/user-guide/concepts/connectors/
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
