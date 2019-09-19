# CSS (`@hint/parser-css`)

The `CSS` parser is built on top of [PostCSS][postcss] so hints can
analyze `CSS` files.

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
    "parsers": ["css"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the following events:

* `parse::start::css` of type `Event` which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::css` of type `StyleParse` which has the following information:

  * `ast`: a PostCSS `Root` object containing the AST.
    See the [PostCSS `walk*` APIs][postcss-walk] for help navigating
    the AST.
  * `code`: a string containing the raw stylesheet source code.
  * `element`: an `HTMLElement` reference if the source was inline
    in HTML; `null` otherwise.
  * `resource`: the parsed resource. If the CSS is in a `style tag`
    and not a file, the value will refer to the HTML document containing
    the stylesheet.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[postcss]: https://postcss.org/
[postcss-walk]: https://api.postcss.org/Container.html#walk
