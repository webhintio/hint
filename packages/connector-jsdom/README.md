# JSDOM connector (`@hint/connector-jsdom`)

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

<!-- Link labels: -->

[jsdom]: https://github.com/jsdom/jsdom
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
