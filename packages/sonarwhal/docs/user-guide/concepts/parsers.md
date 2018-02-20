# Parsers

A `parser` is capable of understanding more deeply a resource and expose
that information via events so rules can be built on top of this information.
E.g.: a `JavaScript` parser built on top of `ESLint` so rules for analyzing
`JavaScript` files can be built.

You can specify what `parser`s you want to use via the `.sonarwhalrc`
configuration file:

```json
{
    "parsers": ["parser1", "parser2"]
}
```

## List of official `parser`s

* [`javascript`][@sonarwhal/parser-javascript]: A `JavaScript` parser built on top of `ESLint` so rules for
  analyzing `JavaScript` files can be built.

## How to use a parser

To use a parse you need to subscribe to the event(s) that the parser dispatches.

### `javascript` parser

To create a rule that understands JavaScript you will need to use the
event `parser::javascript` emitted by the [`javascript parser`][parsers].
This event is of type `IScriptParse` which has the following information:

* `resource`: the parsed resource. If the JavaScript is in a `script tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

<!-- Link labels: -->

[@sonarwhal/parser-javascript]: https://npmjs.com/packages/@sonarwhal/parser-javascript/
