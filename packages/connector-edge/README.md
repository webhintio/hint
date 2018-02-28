# Edge connector (`@sonarwhal/connector-edge`)

A connector to use Microsoft Edge via the [edge diagnostics adapter](https://github.com/Microsoft/edge-diagnostics-adapter)
in `sonarwhal`.

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

Configure the connector name in your `.sonarwhalrc` configuration file:

```json
{
    "connector": {
        "name": "connector-edge"
    }
}
```

Configure the adapter to use an empty HTML opening a new
browser or tab:

```json
{
    "connector": {
        "name": "connector-edge",
        "options": {
            "useTabUrl": true,
            "tabUrl": "https://empty.sonarwhal.com/"
        }
    }
}
```

## Code of Conduct

This project adheres to the [JS Foundation's code of
conduct](https://js.foundation/community/code-of-conduct).

By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
