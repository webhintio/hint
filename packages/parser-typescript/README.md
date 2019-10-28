# TypeScript (`@hint/parser-typescript`)

The `typescript` parser emits the same events as `@hint/parser-javascript`
so existing hints targeting JavaScript files can analyze TypeScript files
without modification. Existing hints targeting HTML files can also analyze
TSX content without modification if `@hint/parser-jsx` is active in addition
to this parser.

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
    "parsers": ["jsx", "typescript"],
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
  * `resource`: the parsed resource. If the script is in
    a `script tag` and not a file, the value will refer to the
    HTML document containing the script.
  * `sourceCode`: the raw source code that was parsed.
  * `tokens`: a list of tokens generated from the source code.
  * `walk`: helper methods for walking the AST.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
