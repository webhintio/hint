# Parsers

A parser is capable of understanding more deeply a resource and exposing
that information via events so hints can be created to use and analyze
this data. E.g.: the [official JavaScript parser][javascript] was built
on top of ESLint so hints for analyzing JavaScript files could be
written.

To utilize a parser, first install its package. The package name should
begin with `@hint/parser-`, `webhint-parser-`, or
`@scope/webhint-parser-`. Once you've installed the appropriate
package, specify which parsers you want to use by adding them to the
`parsers` array in your .hintrc configuration file. Packages within the
`@hint/` namespace (like, for example, `@hint/parser-html`) can be added
using their short name.

If you've installed `@hint/parser-example1` and
`webhint-parser-example2`, add the following:

```json
{
    "parsers": [
        "example1",
        "webhint-parser-example2"
    ]
}
```

## List of official parsers

* [`@hint/parser-babel-config`][babel-config] A Babel configuration
  parser which validates the provided json so hints analyzing .babelrc
  files can be built.

* [`@hint/parser-css`][css]: A CSS parser built on top of [PostCSS][] so
  hints can analyze CSS files.

* [`@hint/parser-html`][html]: An HTML parser built on top of jsdom.
  This parser is only necessary if you are using the [local connector][]
  and analyzing local HTML files. Otherwise the related HTML events are
  taken care directly by the other connectors.

* [`@hint/parser-javascript`][javascript]: A JavaScript parser built on
  top of ESLint so hints for analyzing JavaScript files can be built.

* [`@hint/parser-manifest`][manifest]: A parser that checks validity of
  a web app manifest and emits information related to said manifest.

* [`@hint/parser-typescript-config`][typescript-config]: A parser that
  checks validity of a TypeScript configuration.

## How to use a parser

To utilize a parser when writing your own hints, subscribe to the
event(s) it dispatches and consume the accompanying event payload. Check
out the links below for more detailed documentation on each parser, or
the [hint creation guide][] for more information on how to create a hint
taking advantage of these events.

### Example: javascript parser

To create a hint that understands JavaScript you will need to import the
`ScriptEvents` object defining events emitted by the [javascript
parser][javascript], apply it to your `HintContext`, and register for
the `parse::end::javascript` event.

```typescript
import { ScriptEvents } from `@hint/parser-javascript`;

public constructor(context: HintContext<ScriptEvents>) {
    ...
    context.on('parse::end::javascript', (event) => {
        ...
    });
}
```

In this example the `event` is of type `ScriptParse` which has the
following information:

* `resource`: the parsed resource. If the JavaScript is in a script tag
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: an eslint `SourceCode` object.

### Example: css and javascript parsers

To create a hint that understands multiple resource types you will need
to import the event definitions from all target parsers and apply each
of them to your `HintContext` using a type intersection (`&`).

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

[babel-config]: https://npmjs.com/package/@hint/parser-babel-config/
[css]: https://npmjs.com/package/@hint/parser-css/
[html]: https://npmjs.com/package/@hint/parser-html/
[javascript]: https://npmjs.com/package/@hint/parser-javascript/
[manifest]: https://npmjs.com/package/@hint/parser-manifest/
[typescript-config]:https://npmjs.com/package/@hint/parser-typescript-config/
[local connector]: https://webhint.io/docs/user-guide/connectors/connector-local/
[PostCSS]: https://postcss.org/
[hint creation guide]: https://webhint.io/docs/contributor-guide/guides/create-custom-hint/
