# Edge connector (`@sonarwhal/connector-edge`)

A connector to use Microsoft Edge via the [edge diagnostics
adapter][eda] in `sonarwhal`.

## Installation

First, you need to install [`sonarwhal`](https://sonarwhal.com/):

```bash
npm install sonarwhal
```

Then, install the new connector:

```bash
npm install @sonarwhal/connector-edge
```

## Known issues

* This connector needs to be run as `Administrator`.
* `onLoadingFailed` event is not dispatched.
* `Security` is not implemented.
* Edge has to open a URL by default so, before navigate,
  you can get some events for that URL. To avoid that,
  you should enable the property `useTabUrl` to `true`
  and then set the property `tabUrl` with an url to an empty
  html in the connector options. You can use the url
  `https://empty.sonarwhal.com/`.

## Usage

Configure the connector name in your [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {
        "name": "edge"
    },
    ...
}
```

Configure the adapter to use an empty HTML opening a new
browser or tab:

```json
{
    "connector": {
        "name": "edge",
        "options": {
            "useTabUrl": true,
            "tabUrl": "https://empty.sonarwhal.com/"
        }
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[eda]: https://github.com/Microsoft/edge-diagnostics-adapter
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[connectors]: https://sonarwhal.com/docs/user-guide/concepts/connectors/
