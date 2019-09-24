# JavaScript (`@hint/parser-javascript`)

The `javascript` parser allows hints to analyze `JavaScript` files.

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

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

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

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
