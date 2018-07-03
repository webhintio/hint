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

* [`javascript`][@hint/parser-javascript]: A `JavaScript`
  parser built on top of `ESLint` so hints for analyzing `JavaScript`
  files can be built.

* [`typescript-config`][@hint/parser-typescript-config]: A parser
  that validates if the `TypeScript configuration` is valid.

## How to use a parser

To use a parse you need to subscribe to the event(s) that the parser dispatches.

### `javascript` parser

To create a hint that understands JavaScript you will need to use the
event `parse::javascript` emitted by the
[`javascript parser`][@hint/parser-javascript].
This event is of type `ScriptParse` which has the following information:

* `resource`: the parsed resource. If the JavaScript is in a `script tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

### `typescript-config` parser

To create a hint that understands a TypeScript configuration you will need
to use the event `parse::typescript-config` emiited by the
[`typescript-config`][@hint/parser-typescript-config].
This event is of type `TypeScriptConfigParse` wich has the following
information:

* `resource`: the parsed resource.
* `config`: an object with a valid the configuration.

<!-- Link labels: -->

[@hint/parser-javascript]: https://npmjs.com/packages/@hint/parser-javascript/
[@hint/parser-typescript-config]:https://npmjs.com/packages/@hint/parser-typescript-config/
