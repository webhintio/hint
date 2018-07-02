# Parser javascript (`@hint/parser-javascript`)

The `javascript` parser is built on top of `ESLint` so hints can analyze
`JavaScript` files.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-javascript
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": ["javascript"],
    "hints": {
        ...
    },
    ...
}
```

## Events emitted

This `parser` emits the event `parse::javascript`, of type `IScriptParse`
which has the following information:

* `resource`: the parsed resource. If the JavaScript is in a `script tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
