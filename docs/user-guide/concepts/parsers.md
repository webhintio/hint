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

The built-in `parser`s are:

* `javascript`: A `JavaScript` parser built on top of `ESLint` so rules for
  analyzing `JavaScript` files can be built.
