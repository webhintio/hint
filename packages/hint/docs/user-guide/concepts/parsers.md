# Parsers

A `parser` is capable of understanding more deeply a resource and expose
that information via events so hints can be built on top of this information.
E.g.: a `JavaScript` parser built on top of `ESLint` so hints for analyzing
`JavaScript` files can be built.

You can specify what `parser`s you want to use via the `.hintrc`
configuration file:

```json
{
    "parsers": ["parser1", "parser2"]
}
```

## List of official `parser`s

* [`babel-config`][@hint/parser-babel-config] A `Babel configuration` parser
  which validates the provided `json` so hints analyzing `.babelrc` files can
  be built.

* [`css`][@hint/parser-css]: A `CSS` parser built on top of
  [PostCSS][postcss] so hints can analyze `CSS` files.

* [`html`][@hint/parser-html]: An `HTML` parser built on top of `jsdom`.
  This parser is only necessary if you are using the `local connector`
  and analyzing local `HTML` files. Otherwise the related `HTML` events
  are taken care directly by the other `connector`s.

* [`javascript`][@hint/parser-javascript]: A `JavaScript`
  parser built on top of `ESLint` so hints for analyzing `JavaScript`
  files can be built.

* [`manifest`][@hint/parser-manifest]: A parser that validates if a
  `web app manifest` is valid and emit information related to it.

* [`typescript-config`][@hint/parser-typescript-config]: A parser
  that validates if the `TypeScript configuration` is valid.

## How to use a parser

To use a parse you need to subscribe to the event(s) that the parser dispatches.
Please check the details page of each parser to have more information about the
events emitted by them.

<!-- Link labels: -->

[@hint/parser-babel-config]: https://npmjs.com/package/@hint/parser-babel-config/
[@hint/parser-css]: https://npmjs.com/packages/@hint/parser-css/
[@hint/parser-javascript]: https://npmjs.com/packages/@hint/parser-javascript/
[@hint/parser-html]: https://npmjs.com/packages/@hint/parser-html/
[@hint/parser-manifest]: https://npmjs.com/packages/@hint/parser-manifest/
[@hint/parser-typescript-config]:https://npmjs.com/packages/@hint/parser-typescript-config/
