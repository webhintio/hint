# JSX (`@hint/parser-jsx`)

The `jsx` parser allows hints to analyze HTML elements from `JSX` files.
It operates on ASTs received via `parse::end::javascript` events and
emits the same events as `@hint/parser-html`. This ensures existing hints
targeting `HTML` files will work without modification.

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
    "parsers": ["javascript", "jsx"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the event `parse::end::html` of type `HTMLParse`
which has the following information:

* `document`: an `HTMLDocument` object containing the
  parsed document.
* `html`: a string containing the generated HTML source code.
* `resource`: the parsed resource.

And the event `parse::start::html` of type `Event` which has the
following information:

* `resource`: the resource that is going to be parsed

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
