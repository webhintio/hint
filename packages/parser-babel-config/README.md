# Babel config (`@hint/parser-babel-config`)

The `babel-config` parser allows the user to analyze the Babel
configuration in their projects.

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        ...
    },
    "parsers": ["babel-config"],
    ...
}
```

This parser detects if a `.babelrc` configuration file is present,
or if the Babel configuration is specified in `package.json`, and
validates the Babel configuration against the schema.

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the following events:

* `parse::start::babel-config`, of type `BabelConfigParseStart`
  which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::babel-config`, of type `BabelConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration.

* `parse::error::babel-config::json`, of type `BabelConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::babel-config::circular`, of type `BabelConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::babel-config::extends`, of type `BabelConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::babel-config::schema`, of type `BabelConfigInvalidSchema`
  which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

## Types

If you need to import any type or enum defined in this parser,
you need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-babel-config';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
