# CSS parser (`@hint/parser-css`)

The `css` parser is built on top of [PostCSS][postcss] so hints can
analyze `CSS` files.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-css
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
    "parsers": ["css"],
    ...
}
```

## Events emitted

This `parser` emits the event `parse::css`, of type `StyleParse`
which has the following information:

* `ast`: a PostCSS `Root` object containing the AST.
* `code`: a string containing the raw stylesheet source code.
* `resource`: the parsed resource. If the CSS is in a `style tag`
  and not a file, the value will be `Inline CSS`.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[postcss]: https://postcss.org/
