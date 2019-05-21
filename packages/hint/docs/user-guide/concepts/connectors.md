# Connectors

A `connector` is the interface between the `hint`s and the website
you are testing. It is responsible for loading the website and exposing
all the information to `webhint` such as resources, network data, etc.

To configure a connector you need to update your `.hintrc` file to
make it look like the following:

```json
{
    "connector": {
        "name": "connectorName"
    }
}
```

Where `connectorName` is the name of the connector.

## Official connectors and platform support

All the built-in `connector`s run in any of the supported platforms:
Linux, macOS, and Windows. The only caveat is that, for the `connector`
that you specify in the`.hintrc` file, you will need to have the
browser the `connector` is for installed as `webhint` will not
install it for you.

The current list of supported connectors is available [here][connectors].

## Configuration

`connector`s can be configured. Maybe you want to do a request with
another `userAgent`, change some of the other defaults, etc. For that,
you have to add the property `options` to your `connector` property
with the values you want to modify:

```json
"connector": {
    "name": "connectorName",
    "options": {}
}
```

Please check the [dedicated page][connectors] for each one to know
more about the different options available for each `connector`.

<!-- Link labels: -->

[how to connector]: ../../contributor-guide/how-to/connector.md
[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[request]: https://github.com/request/request
[wsl-interop]: https://msdn.microsoft.com/en-us/commandline/wsl/release_notes#build-14951
