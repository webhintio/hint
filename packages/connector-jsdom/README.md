# Edge connector (`@sonarwhal/connector-edge`)

A connector to use [jsdom][jsdom] in `sonarwhal`.

## Installation

First, you need to install [`sonarwhal`](https://sonarwhal.com/):

```bash
npm install sonarwhal
```

Then, install the new connector:

```bash
npm install @sonarwhal/connector-jsdom
```

## Known issues

* It will not send the events for:

  * `element::#document`
  * `element::#comment`

## Usage

Configure the connector name in your [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    ...
    "connector": {
        "name": "connector-jsdom"
    },
    ...
}
```

### jsdom configuration

`jsdom` allows you to configure the following:

* `headers`: the headers used to fetch the resources. By default they are:

```json
 {
    "Accept-Language": "en-US,en;q=0.8,es;q=0.6,fr;q=0.4",
    "Cache-Control": "no-cache",
    "DNT": 1,
    "Pragma": "no-cache",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.2924.87 Safari/537.36"
}
```

## Further Reading

* [Connectors][connectors]

## Code of Conduct

This project adheres to the [JS Foundation's code of
conduct](https://js.foundation/community/code-of-conduct).

By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).

<!-- Link labels: -->

[jsdom]: https://github.com/jsdom/jsdom
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[connectors]: https://sonarwhal.com/docs/user-guide/concepts/connectors/
