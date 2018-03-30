# Parser javascript (`@sonarwhal/parser-javascript`)

The `javascript` parser is built on top of `ESLint` so rules can analyze
`JavaScript` files.

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/parser-javascript
```

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": ["javascript"],
    "rules": {
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

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
