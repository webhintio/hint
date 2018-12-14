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

### Example: `javascript` parser

To create a hint that understands JavaScript you will need to import the
`ScriptEvents` object defining events emitted by the
[`javascript parser`][@hint/parser-javascript], apply it to your
`HintContext`, and register for the `parse::end::javascript` event.

```typescript
import { ScriptEvents } from `@hint/parser-javascript`;

public constructor(context: HintContext<ScriptEvents>) {
    ...
    context.on('parse::end::javascript', (event) => {
        ...
    });
}
```

In this example the `event` is of type `ScriptParse` which has the following
information:

* `resource`: the parsed resource. If the JavaScript is in a `script tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

### Example: `css` and `javascript` parsers

To create a hint that understands multiple resource types you will need to
import the event definitions from all target `parser`s and apply each of them
to your `HintContext` using a type intersection (`&`).

```typescript
import { StyleEvents } from `@hint/parser-css`;
import { ScriptEvents } from `@hint/parser-javascript`;

public constructor(context: HintContext<StyleEvents & ScriptEvents>) {
    ...
    context.on('parse::end::css', (styleParseEvent) => {
        ...
    });
    context.on('parse::end::javascript', (scriptParseEvent) => {
        ...
    });
}
```

<!-- Link labels: -->

[@hint/parser-babel-config]: https://npmjs.com/package/@hint/parser-babel-config/
[@hint/parser-css]: https://npmjs.com/package/@hint/parser-css/
[@hint/parser-html]: https://npmjs.com/package/@hint/parser-html/
[@hint/parser-javascript]: https://npmjs.com/package/@hint/parser-javascript/
[@hint/parser-manifest]: https://npmjs.com/package/@hint/parser-manifest/
[@hint/parser-typescript-config]:https://npmjs.com/package/@hint/parser-typescript-config/
[postcss]: https://postcss.org/
