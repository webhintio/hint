# Edge connector (`@hint/connector-edge`)

A connector to use Microsoft Edge via the [edge diagnostics
adapter][eda] in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-edge
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
  `https://empty.webhint.io/`.

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
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
            "tabUrl": "https://empty.webhint.io/"
        }
    },
    ...
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[eda]: https://github.com/Microsoft/edge-diagnostics-adapter
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
