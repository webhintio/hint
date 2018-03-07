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

* [`javascript`][@sonarwhal/parser-javascript]: A `JavaScript`
parser built on top of `ESLint` so rules for analyzing `JavaScript`
files can be built.

* [`typescript-parser`][@sonarwhal/parser-typescript-config]: A parser
that validate if the `TypeScript configuration` is valid.

## How to use a parser

To use a parse you need to subscribe to the event(s) that the parser dispatches.

### `javascript` parser

To create a rule that understands JavaScript you will need to use the
event `parser::javascript` emitted by the
[`javascript parser`][@sonarwhal/parser-javascript].
This event is of type `ScriptParse` which has the following information:

* `resource`: the parsed resource. If the JavaScript is in a `script tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

### `typescript-config` parser

To create a rule that understands a TypeScript configuration you will need
to use the event `parser::typescript-config` emiited by the
[`typescript-config`][@sonarwhal/parser-typescript-config].
This event is of type `TypeScriptConfigParse` wich has the following
information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid the configuration.

<!-- Link labels: -->

[@sonarwhal/parser-javascript]: https://npmjs.com/packages/@sonarwhal/parser-javascript/
[@sonarwhal/parser-typescript-config]:https://npmjs.com/packages/@sonarwhal/parser-typescript-config/
