# JavaScript (`@hint/parser-javascript`)

The `javascript` parser is built on top of `ESLint` so hints can
analyze `JavaScript` files.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-javascript
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        ...
    },
    "parsers": ["javascript"],
    ...
}
```

## Events emitted

This `parser` emits the following events:

* `parse::start::javascript` of type `Event` which contains the following
  information:

  * `resource`: the resource we are going to parse.

* `parse::end::javascript`, of type `ScriptParse` which contains the following
  information:

  * `ast`: an `ESTree` AST generated from the script.
  * `element`: an `HTMLElement` reference if the source was inline
    in HTML; `null` otherwise.
  * `resource`: the parsed resource. If the JavaScript is in
    a `script tag` and not a file, the value will refer to the
    HTML document containing the script.
  * `sourceCode`: the raw source code that was parsed.
  * `tokens`: a list of tokens generated from the source code.
  * `walk`: helper methods for walking the AST.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
