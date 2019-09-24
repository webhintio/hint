# Local (`@hint/connector-local`)

A local connector to analyze the local files in your project
with `webhint`.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {
        "name": "local"
    },
    ...
}
```

## Options

`local` allows you to configure the following:

* `pattern`: Add or ignore files defined in the pattern. By default the
  `local` connector will use the following pattern `['**', '!.git/**']`. This
  doesn't apply if you are targeting just a file or if you are using the
  options `content`.
* `watch`: Run `webhint` in watch mode. Watch files and trigger the analysis
  on changes.

```json
{
    "connector": {
        "name": "local",
        "options": {
            "pattern": ["**", "!.git/**"],
            "watch": false
        }
    },
    ...
}
```

In addition, the `local` connector accept a new parameter in the
method `collect` that allow you to pass the content to analyze as an string.
To use that property, you need to call to the `executeOn` method in
the engine with the content to analyze.

```js
engine.executeOn(url, {content: '{{your content}}'});
```

## Further Reading

* [Connectors oerview][connectors]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
