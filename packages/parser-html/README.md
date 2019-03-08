# HTML (`@hint/parser-html`)

The `HTML` parser is built on top of [`jsdom`][jsdom] so hints can
analyze `HTML` files.

Note: This parser is currently only needed if using the `local`
[connector][connectors]. Other connectors provide their own DOM to
generate events instead.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-html
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
    "parsers": ["html"],
    ...
}
```

## Events emitted

This `parser` emits the event `parse::end::html` of type `HTMLParse`
which has the following information:

* `document`: an `HTMLDocument` object containing the
  parsed document.
* `html`: a string containing the raw HTML source code.
* `resource`: the parsed resource.

And the event `parse::start::html` of type `Event` which has the
following information:

* `resource`: the resource that is going to be parsed.

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[events]: https://webhint.io/docs/contributor-guide/getting-started/events/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[jsdom]: https://github.com/jsdom/jsdom
